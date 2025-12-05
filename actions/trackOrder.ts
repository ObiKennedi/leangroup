"use server";

import * as z from "zod";
import { TrackingIdSchema } from "@/schema";
import { db } from "@/lib/db"; 

export const findDeliveryByTrackingId = async (
    values: z.infer<typeof TrackingIdSchema>
) => {
    
    const validated = TrackingIdSchema.safeParse(values);

    if (!validated.success) {
        return { error: "Invalid Tracking ID format." };
    }

    const { trackingId } = validated.data;

    try {
        
        const delivery = await db.delivery.findFirst({
            where: { trackingId },
        });

        if (!delivery) {
            return { error: "No delivery found for this Tracking ID." };
        }

        // Serialize the delivery data to avoid Date serialization issues
        return { 
            success: true, 
            delivery: {
                id: delivery.id,
                trackingId: delivery.trackingId,
                status: delivery.status,
                senderName: delivery.senderName,
                senderPhone: delivery.senderPhone,
                receiverName: delivery.receiverName,
                receiverPhone: delivery.receiverPhone,
                pickupAddress: delivery.pickupAddress,
                deliveryAddress: delivery.deliveryAddress,
                weight: delivery.weight,
                createdAt: delivery.createdAt.toISOString(),
                updatedAt: delivery.updatedAt.toISOString(),
                arrivalDate: delivery.arrivalDate?.toISOString() || null,
            }
        };
    } catch (error) {
        console.error("Error searching for delivery:", error);
        return { error: "Something went wrong. Try again later." };
    }
};