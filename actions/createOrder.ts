"use server";

import { db } from "@/lib/db";
import { generateTrackingId } from "@/lib/trackingId";

export const createOrder = async (
  data: {
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    pickupAddress: string;
    deliveryAddress: string;
    weight: number;
  },
  // 1. ADD THE REQUIRED userId HERE
  userId: string // <-- Assumes you pass the authenticated user ID from the client/server environment
) => {
  try {
    // Check if the userId is provided before proceeding
    if (!userId) {
      return {
        success: false,
        message: "Authentication error: User ID is missing.",
      };
    }

    const newOrder = await db.delivery.create({
      data: {
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        pickupAddress: data.pickupAddress,
        deliveryAddress: data.deliveryAddress,
        weight: data.weight,
        // 2. FIX: CONNECT THE DELIVERY TO THE USER
        user: {
          connect: {
            id: userId, // Link the delivery to the authenticated user's ID
          },
        },
      },
    });

    const trackingId = await generateTrackingId(newOrder.id);

    return {
      success: true,
      message: "Order created successfully",
      order: newOrder,
      trackingId,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: "Failed to create order",
    };
  }
};