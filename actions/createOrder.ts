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

// Helper function to calculate distance between two points (Haversine formula)
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
    if (!userId) {
      return {
        success: false,
        message: "Authentication error: User ID is missing.",
      };
    }

    // Create delivery with enhanced tracking fields in a transaction
    const result = await db.$transaction(async (tx) => {
      // Calculate initial coordinates (first route point if available)
      const initialLat = data.routes && data.routes.length > 0 
        ? data.routes[0].latitude 
        : undefined;
      const initialLon = data.routes && data.routes.length > 0 
        ? data.routes[0].longitude 
        : undefined;

      // Create the delivery
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
          statusReason: data.statusReason || "Awaiting package pickup",
          originCountry: data.originCountry,
          destinationCountry: data.destinationCountry,
          currentLocation: data.pickupAddress,
          currentLatitude: initialLat,
          currentLongitude: initialLon,
          currentRouteIndex: 0,
          estimatedArrival: data.estimatedArrival,
          status: DeliveryStatus.PENDING,
          transitSpeed: 60, // Default 60 km/h for animation
          user: {
            connect: { id: userId },
          },
        },
      });

      // Create route points if provided
      if (data.routes && data.routes.length > 0) {
        // Calculate distances between consecutive route points
        const routesWithDistances = data.routes.map((route, index) => {
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

          return {
            deliveryId: newOrder.id,
            countryCode: route.countryCode,
            countryName: route.countryName,
            cityName: route.cityName,
            latitude: route.latitude,
            longitude: route.longitude,
            sequence: index + 1,
            isPassed: index === 0, // First route is where package starts
            passedAt: index === 0 ? new Date() : null,
            estimatedArrivalTime: route.estimatedArrivalTime,
            distanceFromPrevious: distanceFromPrevious,
          };
        });

        await tx.route.createMany({
          data: routesWithDistances,
        });
      }

      // Create initial tracking history entry
      await tx.trackingHistory.create({
        data: {
          deliveryId: newOrder.id,
          status: DeliveryStatus.PENDING,
          location: data.pickupAddress,
          countryCode: data.originCountry,
          latitude: initialLat,
          longitude: initialLon,
          description: data.statusReason || "Order created and awaiting pickup",
        },
      });

      return newOrder;
    });

    const trackingId = await generateTrackingId(result.id);

    if (!trackingId) {
      throw new Error("Failed to generate tracking ID");
    }

    // Generate receipt data
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

    return {
      success: true,
      message: "Order created successfully with live tracking enabled",
      order: result,
      trackingId,
      receipt,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: "Failed to create order. Please try again.",
    };
  }
};