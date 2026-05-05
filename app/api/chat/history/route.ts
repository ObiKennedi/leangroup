import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatSession = await db.chatSession.findFirst({
        where: { userId: session.user.id },
        include: {
            messages: { orderBy: { createdAt: "asc" } },
        },
    })

    return NextResponse.json(chatSession?.messages || [])
}