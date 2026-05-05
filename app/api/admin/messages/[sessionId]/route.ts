import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

// 1. Update the type definition: params is now a Promise
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Await the params to get the sessionId
    const { sessionId } = await params

    try {
        const messages = await db.chatMessage.findMany({
            where: { sessionId: sessionId },
            orderBy: { createdAt: "asc" },
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error("Database error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}