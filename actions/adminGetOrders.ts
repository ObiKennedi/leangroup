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

        console.log('Found orders:', orders.length); // Add logging
        return orders;
    } catch (error) {
        console.error('Error fetching orders:', error); // Log the actual error
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