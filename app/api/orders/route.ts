import { NextResponse } from "next/server";
import { getAllOrders } from "@/actions/adminGetOrders";
import { auth } from "@/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');

        const orders = await getAllOrders({
            status: status as any,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}