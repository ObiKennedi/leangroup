import { getOrderById } from "@/data/orders";
import { db } from "./db";

/**
 * Generates a professional tracking ID in format: LG-XXXX-YYYY-ZZZZ
 * Example: LG-8H2K-9M4P-7N3Q
 */
export const generateTrackingId = async (id: string): Promise<string> => {
  try {
    // Fetch the order to confirm it exists
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      throw new Error(`Order with ID ${id} not found.`);
    }

    // Generate unique tracking ID with retries
    let trackingId: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      trackingId = generateFormattedTrackingId();

      // Check if tracking ID already exists
      const existing = await db.delivery.findUnique({
        where: { trackingId },
      });

      if (!existing) break;

      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate unique tracking ID after multiple attempts");
      }
    } while (attempts < maxAttempts);

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
    throw new Error("Failed to generate tracking ID");
  }
};

/**
 * Generates a formatted tracking ID: LG-XXXX-YYYY-ZZZZ
 * Uses alphanumeric characters excluding confusing ones (0, O, I, 1)
 */
function generateFormattedTrackingId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Excludes 0, O, I, 1
  const prefix = "LG"; // Luxury Global prefix

  const generateSegment = (length: number) => {
    let segment = "";
    for (let i = 0; i < length; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  };

  // Format: LG-XXXX-YYYY-ZZZZ
  return `${prefix}-${generateSegment(4)}-${generateSegment(4)}-${generateSegment(4)}`;
}

/**
 * Alternative: Sequential tracking ID with date
 * Format: LG-YYYYMMDD-NNNN
 * Example: LG-20241206-0001
 */
export async function generateSequentialTrackingId(id: string): Promise<string> {
  try {
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      throw new Error(`Order with ID ${id} not found.`);
    }

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

    // Get count of orders created today
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayOrdersCount = await db.delivery.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(todayOrdersCount + 1).padStart(4, "0");
    const trackingId = `LG-${dateStr}-${sequence}`;

    // Update the order
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
    throw new Error("Failed to generate tracking ID");
  }
}