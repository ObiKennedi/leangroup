import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, message } = await req.json()
    if (!sessionId || !message?.trim()) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const chatSession = await db.chatSession.findUnique({
        where: { id: sessionId },
        include: { user: true },
    })

    if (!chatSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const chatMessage = await db.chatMessage.create({
        data: {
            sessionId,
            sender: "admin",
            text: message.trim(),
            read: true,
        },
    })

    await db.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
    })

    // Push to user channel so user sees reply instantly
    await pusherServer.trigger(`chat-${chatSession.userId}`, "new-message", {
        sender: "admin",
        text: message.trim(),
        createdAt: chatMessage.createdAt,
    })

    // Push to admin channel so other admin tabs update
    await pusherServer.trigger("admin-chat", "new-message", {
        sessionId,
        userId: chatSession.userId,
        sender: "admin",
        text: message.trim(),
        createdAt: chatMessage.createdAt,
    })

    return NextResponse.json({ success: true })
}