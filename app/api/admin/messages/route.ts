import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

// GET all sessions with latest message + unread count
export async function GET() {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await db.chatSession.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            user: { select: { id: true, name: true, email: true, image: true } },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    })

    const withUnread = await Promise.all(
        sessions.map(async (s) => {
            const unreadCount = await db.chatMessage.count({
                where: { sessionId: s.id, sender: "user", read: false },
            })
            return { ...s, unreadCount }
        })
    )

    return NextResponse.json(withUnread)
}

// PATCH — mark all messages in a session as read
export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await req.json()

    await db.chatMessage.updateMany({
        where: { sessionId, sender: "user", read: false },
        data: { read: true },
    })

    return NextResponse.json({ success: true })
}