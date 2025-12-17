"use server";

import { db } from "@/lib/db";
import { generateTrackingId } from "@/lib/trackingId";
import { DeliveryStatus } from "@prisma/client";

interface RoutePoint {
  countryCode: string;
  countryName: string;
  cityName?: string;
  latitude: number;
  longitude: number;
  estimatedArrivalTime?: Date;
}

interface Receipt {
  orderId: string;
  trackingId: string;
  orderDate: Date;
  sender: {
    name: string;
    phone: string;
    address: string;
  };
  receiver: {
    name: string;
    phone: string;
    address: string;
  };
  shipment: {
    weight: number;
    packageDescription?: string;
    originCountry: string;
    destinationCountry: string;
    estimatedArrival?: Date;
    status: string;
    statusReason?: string;
  };
  routes: RoutePoint[];
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Create a new delivery order with routes and tracking
 */
export const createOrder = async (
  data: {
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    pickupAddress: string;
    deliveryAddress: string;
    weight: number;
    packageDescription?: string;
    statusReason?: string;
    originCountry: string;
    destinationCountry: string;
    routes?: RoutePoint[];
    estimatedArrival?: Date;
  },
  userId: string
) => {
  try {
    // Validate user
    if (!userId) {
      return {
        success: false,
        message: "Authentication error: User ID is missing.",
      };
    }

    // Get initial coordinates from first route (if available)
    const initialLat = data.routes?.[0]?.latitude;
    const initialLon = data.routes?.[0]?.longitude;
    const initialLocation = data.routes?.[0]
      ? `${data.routes[0].cityName || data.routes[0].countryName}, ${data.routes[0].countryName}`
      : data.pickupAddress;

    // Create delivery with routes in a transaction
    const result = await db.$transaction(async (tx) => {
      // STEP 1: Create the delivery
      const newOrder = await tx.delivery.create({
        data: {
          senderName: data.senderName,
          senderPhone: data.senderPhone,
          receiverName: data.receiverName,
          receiverPhone: data.receiverPhone,
          pickupAddress: data.pickupAddress,
          deliveryAddress: data.deliveryAddress,
          weight: data.weight,
          packageDescription: data.packageDescription,
          statusReason: data.statusReason || "Order created. Package at origin, awaiting pickup",
          originCountry: data.originCountry,
          destinationCountry: data.destinationCountry,

          // Initial location data (first checkpoint)
          currentLocation: initialLocation,
          currentLatitude: initialLat,
          currentLongitude: initialLon,
          currentRouteIndex: 0, // Start at first checkpoint

          estimatedArrival: data.estimatedArrival,
          status: DeliveryStatus.PENDING,
          transitSpeed: 60, // Default speed for animation (km/h)
          lastRouteUpdate: new Date(),

          user: {
            connect: { id: userId },
          },
        },
      });

      // STEP 2: Create route checkpoints
      if (data.routes && data.routes.length > 0) {
        const routesWithDistances = data.routes.map((route, index) => {
          // Calculate distance from previous checkpoint
          let distanceFromPrevious = 0;
          if (index > 0) {
            const prevRoute = data.routes![index - 1];
            distanceFromPrevious = calculateDistance(
              prevRoute.latitude,
              prevRoute.longitude,
              route.latitude,
              route.longitude
            );
          }

          // CRITICAL: All routes start as NOT passed
          // The route at currentRouteIndex (0) is where we ARE, not where we've BEEN
          return {
            deliveryId: newOrder.id,
            countryCode: route.countryCode,
            countryName: route.countryName,
            cityName: route.cityName,
            latitude: route.latitude,
            longitude: route.longitude,
            sequence: index + 1,

            // All checkpoints start as NOT passed
            isPassed: false,

            // Record arrival time only for the first checkpoint
            passedAt: index === 0 ? new Date() : null,
            actualArrivalTime: index === 0 ? new Date() : null,

            estimatedArrivalTime: route.estimatedArrivalTime,
            distanceFromPrevious: distanceFromPrevious,

            // Checkpoint activity
            checkpointActivity: index === 0
              ? `Package received at ${route.cityName || route.countryName}`
              : null,
          };
        });

        await tx.route.createMany({
          data: routesWithDistances,
        });
      }

      // STEP 3: Create initial tracking history
      await tx.trackingHistory.create({
        data: {
          deliveryId: newOrder.id,
          status: DeliveryStatus.PENDING,
          location: initialLocation,
          countryCode: data.originCountry,
          latitude: initialLat,
          longitude: initialLon,
          description: data.statusReason || "Order created. Package at origin, awaiting pickup",
        },
      });

      return newOrder;
    });

    // Generate tracking ID
    const trackingId = await generateTrackingId(result.id);

    if (!trackingId) {
      throw new Error("Failed to generate tracking ID");
    }

    // Generate receipt
    const receipt: Receipt = {
      orderId: result.id,
      trackingId: trackingId,
      orderDate: result.createdAt,
      sender: {
        name: result.senderName,
        phone: result.senderPhone,
        address: result.pickupAddress,
      },
      receiver: {
        name: result.receiverName,
        phone: result.receiverPhone,
        address: result.deliveryAddress,
      },
      shipment: {
        weight: result.weight,
        packageDescription: result.packageDescription || undefined,
        originCountry: result.originCountry,
        destinationCountry: result.destinationCountry,
        estimatedArrival: result.estimatedArrival || undefined,
        status: result.status,
        statusReason: result.statusReason || undefined,
      },
      routes: data.routes || [],
    };

    console.log("✅ Order created successfully:", {
      orderId: result.id,
      trackingId: trackingId,
      currentRouteIndex: result.currentRouteIndex,
      totalRoutes: data.routes?.length || 0,
    });

    return {
      success: true,
      message: "Order created successfully with live tracking enabled",
      order: result,
      trackingId,
      receipt,
    };
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return {
      success: false,
      message: "Failed to create order. Please try again.",
    };
  }
};