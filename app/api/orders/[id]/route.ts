import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params first (Next.js 15 requirement)
        const { id } = await params;

        const order = await db.delivery.findUnique({
            where: { id },
            include: {
                routes: {
                    orderBy: { sequence: 'asc' }
                },
                trackingHistory: {
                    orderBy: { timestamp: 'desc' }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({
            ...order,
            currentRouteIndex: order.currentRouteIndex || 0
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json(
            { error: "Failed to fetch order" },
            { status: 500 }
        );
    }
}