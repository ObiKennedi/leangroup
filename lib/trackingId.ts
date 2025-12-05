import { getOrderById } from "@/data/orders";
import { db } from "./db";
import { v4 as uuidv4 } from "uuid";

export const generateTrackingId = async (id: string) => {
  try {
    // Generate unique tracking ID
    const trackingId = uuidv4();

    // Fetch the order to confirm it exists
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      console.error(`Order with ID ${id} not found.`);
      return null;
    }

    // Update the order with the tracking ID
    await db.delivery.update({
      where: { id },
      data: {
        trackingId,
        updatedAt: new Date(),
      },
    });

    console.log(`Tracking ID generated successfully: ${trackingId}`);
    return trackingId;

  } catch (error) {
    console.error("Error generating tracking ID:", error);
    return null;
  }
};
