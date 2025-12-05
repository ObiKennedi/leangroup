"use server";

import { getDeliveryByUserId } from "@/data/orders";

export async function getUserOrdersAction(userId: string, email: string) {
    try {
        const orders = await getDeliveryByUserId({ id: userId, email });

        if (!orders) return [];

        return orders.map(order => ({
            id: order.id,
            trackingId: order.trackingId,
            status: order.status,
            weight: order.weight,
            senderName: order.senderName,
            senderPhone: order.senderPhone,
            receiverName: order.receiverName,
            receiverPhone: order.receiverPhone,
            pickupAddress: order.pickupAddress,
            deliveryAddress: order.deliveryAddress,
            arrivalDate: order.arrivalDate,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        }));
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
    }
}
