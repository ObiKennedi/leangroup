"use server";

import { db } from "@/lib/db";
import { DeliveryStatus } from "@prisma/client";

interface RoutePoint {
  countryCode: string;
  countryName: string;
  cityName?: string;
  latitude: number;
  longitude: number;
  estimatedArrivalTime?: Date;
  checkpointActivity?: string;
}

// ==================== GET OPERATIONS ====================

export const getOrderById = async (id: string) => {
  try {
    const order = await db.delivery.findFirst({
      where: { id },
      include: {
        routes: {
          orderBy: { sequence: "asc" },
        },
        trackingHistory: {
          orderBy: { timestamp: "desc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    return order;
  } catch {
    return null;
  }
};

export const getOrderByTrackingId = async (trackingId: string) => {
  try {
    const order = await db.delivery.findUnique({
      where: { trackingId },
      include: {
        routes: {
          orderBy: { sequence: "asc" },
        },
        trackingHistory: {
          orderBy: { timestamp: "desc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    return order;
  } catch {
    return null;
  }
};

export const getDeliveryByUserId = async ({
  id,
  email,
}: {
  id: string;
  email: string;
}) => {
  try {
    const deliveries = await db.delivery.findMany({
      where: {
        user: {
          id: id,
          email: email,
        },
      },
      include: {
        routes: {
          orderBy: { sequence: "asc" },
        },
        trackingHistory: {
          orderBy: { timestamp: "desc" },
          take: 1, // Only get latest tracking for list view
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return deliveries;
  } catch {
    return null;
  }
};

export const getAllOrders = async (options?: {
  status?: DeliveryStatus;
  limit?: number;
  offset?: number;
}) => {
  try {
    const orders = await db.delivery.findMany({
      where: options?.status ? { status: options.status } : undefined,
      orderBy: {
        createdAt: "desc",
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
          },
        },
        routes: {
          orderBy: { sequence: "asc" },
        },
        trackingHistory: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
    });

    return orders;
  } catch {
    return null;
  }
};

export const getOrdersCount = async (status?: DeliveryStatus) => {
  try {
    const count = await db.delivery.count({
      where: status ? { status } : undefined,
    });

    return count;
  } catch {
    return 0;
  }
};

// ==================== UPDATE OPERATIONS ====================

export const updateOrderStatus = async (
  orderId: string,
  status: DeliveryStatus,
  description?: string
) => {
  try {
    const existingOrder = await db.delivery.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return { success: false, error: "Order not found" };
    }

    // Use a fresh transaction with timeout
    const result = await db.$transaction(
      async (tx) => {
        // Update order status
        const updatedOrder = await tx.delivery.update({
          where: { id: orderId },
          data: {
            status,
            ...(status === "DELIVERED" && !existingOrder.arrivalDate
              ? { arrivalDate: new Date() }
              : {}),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
            routes: {
              orderBy: { sequence: "asc" },
            },
          },
        });

        // Add to tracking history
        await tx.trackingHistory.create({
          data: {
            deliveryId: orderId,
            status,
            location:
              updatedOrder.currentLocation || updatedOrder.deliveryAddress,
            latitude: updatedOrder.currentLatitude,
            longitude: updatedOrder.currentLongitude,
            description: description || `Status updated to ${status}`,
          },
        });

        return updatedOrder;
      },
      {
        maxWait: 5000, // Maximum time to wait for a transaction slot (5s)
        timeout: 10000, // Maximum time the transaction can run (10s)
      }
    );

    return { success: true, order: result };
  } catch (error) {
    console.error("Error updating order status:", error);
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message: string };
      if (prismaError.code === 'P2028') {
        return { success: false, error: "Database transaction timeout. Please try again." };
      }
    }
    
    return { success: false, error: "Failed to update order status" };
  }
};

export const updateCurrentLocation = async (
  orderId: string,
  data: {
    latitude: number;
    longitude: number;
    location: string;
    countryCode?: string;
    description?: string;
    checkpointActivity?: string;
  }
) => {
  try {
    const existingOrder = await db.delivery.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return { success: false, error: "Order not found" };
    }

    const result = await db.$transaction(
      async (tx) => {
        // Update delivery location
        const updatedOrder = await tx.delivery.update({
          where: { id: orderId },
          data: {
            currentLatitude: data.latitude,
            currentLongitude: data.longitude,
            currentLocation: data.location,
          },
          include: {
            routes: {
              orderBy: { sequence: "asc" },
            },
          },
        });

        // Add to tracking history
        await tx.trackingHistory.create({
          data: {
            deliveryId: orderId,
            status: updatedOrder.status,
            location: data.location,
            latitude: data.latitude,
            longitude: data.longitude,
            countryCode: data.countryCode,
            description: data.description || data.checkpointActivity || "Location updated",
          },
        });

        // Check and update route checkpoints if country matches
        if (data.countryCode) {
          const checkpoint = await tx.route.findFirst({
            where: {
              deliveryId: orderId,
              countryCode: data.countryCode,
              isPassed: false,
            },
            orderBy: { sequence: "asc" },
          });

          if (checkpoint) {
            await tx.route.update({
              where: { id: checkpoint.id },
              data: {
                isPassed: true,
                passedAt: new Date(),
                actualArrivalTime: new Date(),
                ...(data.checkpointActivity && {
                  checkpointActivity: data.checkpointActivity,
                }),
              },
            });
          }
        }

        return updatedOrder;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return { success: true, order: result };
  } catch (error) {
    console.error("Error updating location:", error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2028') {
        return { success: false, error: "Database transaction timeout. Please try again." };
      }
    }
    
    return { success: false, error: "Failed to update location" };
  }
};

export const updateDestination = async (
  orderId: string,
  data: {
    destinationCountry: string;
    deliveryAddress: string;
    receiverName?: string;
    receiverPhone?: string;
    estimatedArrival?: Date;
  }
) => {
  try {
    const existingOrder = await db.delivery.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return { success: false, error: "Order not found" };
    }

    const result = await db.$transaction(async (tx) => {
      // Update destination details
      const updatedOrder = await tx.delivery.update({
        where: { id: orderId },
        data: {
          destinationCountry: data.destinationCountry,
          deliveryAddress: data.deliveryAddress,
          ...(data.receiverName && { receiverName: data.receiverName }),
          ...(data.receiverPhone && { receiverPhone: data.receiverPhone }),
          ...(data.estimatedArrival && {
            estimatedArrival: data.estimatedArrival,
          }),
        },
        include: {
          routes: {
            orderBy: { sequence: "asc" },
          },
        },
      });

      // Add to tracking history
      await tx.trackingHistory.create({
        data: {
          deliveryId: orderId,
          status: updatedOrder.status,
          location: updatedOrder.currentLocation || updatedOrder.pickupAddress,
          description: "Destination updated",
        },
      });

      return updatedOrder;
    });

    return { success: true, order: result };
  } catch (error) {
    console.error("Error updating destination:", error);
    return { success: false, error: "Failed to update destination" };
  }
};

export const addRouteCheckpoint = async (
  orderId: string,
  routeData: RoutePoint
) => {
  try {
    const existingOrder = await db.delivery.findUnique({
      where: { id: orderId },
      include: {
        routes: {
          orderBy: { sequence: "desc" },
          take: 1,
        },
      },
    });

    if (!existingOrder) {
      return { success: false, error: "Order not found" };
    }

    // Get the next sequence number
    const nextSequence =
      existingOrder.routes.length > 0
        ? existingOrder.routes[0].sequence + 1
        : 1;

    const newRoute = await db.route.create({
      data: {
        deliveryId: orderId,
        countryCode: routeData.countryCode,
        countryName: routeData.countryName,
        cityName: routeData.cityName,
        latitude: routeData.latitude,
        longitude: routeData.longitude,
        estimatedArrivalTime: routeData.estimatedArrivalTime,
        checkpointActivity: routeData.checkpointActivity,
        sequence: nextSequence,
        isPassed: false,
      },
    });

    return { success: true, route: newRoute };
  } catch (error) {
    console.error("Error adding route checkpoint:", error);
    return { success: false, error: "Failed to add route checkpoint" };
  }
};

export const updateRouteCheckpoint = async (
  routeId: string,
  routeData: Partial<RoutePoint> & { 
    isPassed?: boolean;
    actualArrivalTime?: Date;
  }
) => {
  try {
    // Build the update data object dynamically
    const updateData: any = {};
    
    if (routeData.countryCode) updateData.countryCode = routeData.countryCode;
    if (routeData.countryName) updateData.countryName = routeData.countryName;
    if (routeData.cityName !== undefined) updateData.cityName = routeData.cityName;
    if (routeData.latitude !== undefined) updateData.latitude = routeData.latitude;
    if (routeData.longitude !== undefined) updateData.longitude = routeData.longitude;
    if (routeData.estimatedArrivalTime) updateData.estimatedArrivalTime = routeData.estimatedArrivalTime;
    if (routeData.checkpointActivity !== undefined) updateData.checkpointActivity = routeData.checkpointActivity;
    
    if (routeData.isPassed !== undefined) {
      updateData.isPassed = routeData.isPassed;
      if (routeData.isPassed) {
        updateData.passedAt = new Date();
        updateData.actualArrivalTime = routeData.actualArrivalTime || new Date();
      }
    }

    const updatedRoute = await db.route.update({
      where: { id: routeId },
      data: updateData,
    });

    return { success: true, route: updatedRoute };
  } catch (error) {
    console.error("Error updating route checkpoint:", error);
    return { success: false, error: "Failed to update route checkpoint" };
  }
};

export const deleteRouteCheckpoint = async (routeId: string) => {
  try {
    await db.route.delete({
      where: { id: routeId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting route checkpoint:", error);
    return { success: false, error: "Failed to delete route checkpoint" };
  }
};

export const reorderRoutes = async (
  orderId: string,
  routeIds: string[] // Array of route IDs in desired order
) => {
  try {
    await db.$transaction(
      routeIds.map((routeId, index) =>
        db.route.update({
          where: { id: routeId },
          data: { sequence: index + 1 },
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Error reordering routes:", error);
    return { success: false, error: "Failed to reorder routes" };
  }
};

export const bulkUpdateRoutes = async (
  orderId: string,
  routes: RoutePoint[]
) => {
  try {
    const result = await db.$transaction(async (tx) => {
      // Delete existing routes
      await tx.route.deleteMany({
        where: { deliveryId: orderId },
      });

      // Create new routes
      await tx.route.createMany({
        data: routes.map((route, index) => ({
          deliveryId: orderId,
          countryCode: route.countryCode,
          countryName: route.countryName,
          cityName: route.cityName,
          latitude: route.latitude,
          longitude: route.longitude,
          estimatedArrivalTime: route.estimatedArrivalTime,
          checkpointActivity: route.checkpointActivity,
          sequence: index + 1,
          isPassed: false,
        })),
      });

      // Add to tracking history
      await tx.trackingHistory.create({
        data: {
          deliveryId: orderId,
          status: DeliveryStatus.IN_TRANSIT,
          location: "Route updated",
          description: `Route updated with ${routes.length} checkpoints`,
        },
      });

      return await tx.delivery.findUnique({
        where: { id: orderId },
        include: {
          routes: {
            orderBy: { sequence: "asc" },
          },
        },
      });
    });

    return { success: true, order: result };
  } catch (error) {
    console.error("Error bulk updating routes:", error);
    return { success: false, error: "Failed to update routes" };
  }
};

export const getTrackingHistory = async (orderId: string) => {
  try {
    const history = await db.trackingHistory.findMany({
      where: { deliveryId: orderId },
      orderBy: { timestamp: "desc" },
    });

    return { success: true, history };
  } catch (error) {
    console.error("Error fetching tracking history:", error);
    return { success: false, error: "Failed to fetch tracking history" };
  }
};

export const updateCheckpointActivity = async (
  routeId: string,
  activity: string
) => {
  try {
    const updatedRoute = await db.route.update({
      where: { id: routeId },
      data: {
        checkpointActivity: activity,
      },
    });

    return { success: true, route: updatedRoute };
  } catch (error) {
    console.error("Error updating checkpoint activity:", error);
    return { success: false, error: "Failed to update checkpoint activity" };
  }
};