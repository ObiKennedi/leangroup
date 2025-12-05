import { db } from "@/lib/db";

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