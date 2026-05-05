import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messages = await db.chatMessage.findMany({
        where: { sessionId: params.sessionId },
        orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(messages)
}