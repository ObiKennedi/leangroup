"use server"

import { db } from "@/lib/db";
import { DeliveryStatus } from "@prisma/client";

export const getOrderById = async (id: string) => {
    try {
        const orders = await db.delivery.findFirst({ where: { id } })

        return orders
    } catch {
        return null
    }
}

export const getDeliveryByUserId = async ({ id, email }: { id: string, email: string }) => {
    try {
        const deliveries = await db.delivery.findMany({
            where: {
                user: {
                    id: id,
                    email: email
                }
            },
        });
        return deliveries;
    } catch {
        return null;
    }
}

export const getAllOrders = async (options?: {
    status?: DeliveryStatus;
    limit?: number;
    offset?: number;
}) => {
    try {
        const orders = await db.delivery.findMany({
            where: options?.status ? { status: options.status } : undefined,
            orderBy: {
                createdAt: 'desc'
            },
            take: options?.limit,
            skip: options?.offset,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    }
                }
            }
        });
        
        return orders;
    } catch {
        return null;
    }
}

export const getOrdersCount = async (status?: DeliveryStatus) => {
    try {
        const count = await db.delivery.count({
            where: status ? { status } : undefined
        });
        
        return count;
    } catch {
        return 0;
    }
}

export const updateOrderStatus = async (orderId: string, status: DeliveryStatus) => {
    try {
        // Check if order exists
        const existingOrder = await db.delivery.findUnique({
            where: { id: orderId }
        });

        if (!existingOrder) {
            return { success: false, error: "Order not found" };
        }

        // Update the order status
        const updatedOrder = await db.delivery.update({
            where: { id: orderId },
            data: { 
                status,
                // Optionally set arrivalDate when status is DELIVERED
                ...(status === "DELIVERED" && !existingOrder.arrivalDate ? { arrivalDate: new Date() } : {})
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    }
                }
            }
        });

        return { success: true, order: updatedOrder };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: "Failed to update order status" };
    }
}