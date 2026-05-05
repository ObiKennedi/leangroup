import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher-server"
import { sendTelegramAlert } from "@/lib/telegram"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { message } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 })
  }

  const userId = session.user.id
  const userName = session.user.name || "A user"

  // Get or create chat session
  let chatSession = await db.chatSession.findFirst({ where: { userId } })
  if (!chatSession) {
    chatSession = await db.chatSession.create({ data: { userId } })
  }

  // Store message
  const chatMessage = await db.chatMessage.create({
    data: {
      sessionId: chatSession.id,
      sender: "user",
      text: message.trim(),
    },
  })

  // Update session updatedAt so it bubbles to top
  await db.chatSession.update({
    where: { id: chatSession.id },
    data: { updatedAt: new Date() },
  })

  // Push to user's own channel (so their UI updates)
  await pusherServer.trigger(`chat-${userId}`, "new-message", {
    sender: "user",
    text: message.trim(),
    createdAt: chatMessage.createdAt,
  })

  // Push to admin channel (so admin UI updates in real time)
  await pusherServer.trigger("admin-chat", "new-message", {
    userId,
    userName,
    sessionId: chatSession.id,
    sender: "user",
    text: message.trim(),
    createdAt: chatMessage.createdAt,
  })

  // Telegram alert — only on first message or if admin hasn't replied yet
  const isFirstMessage = await db.chatMessage.count({
    where: { sessionId: chatSession.id },
  })
  if (isFirstMessage === 1) {
    await sendTelegramAlert(userName, message.trim())
  }

  return NextResponse.json({ success: true })
}