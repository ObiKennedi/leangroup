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
            include: {
                routes: {
                    orderBy: { sequence: "asc" },
                },
                trackingHistory: {
                    orderBy: { timestamp: "desc" },
                    take: 10,
                },
            },
        });

        if (!delivery) {
            return { error: "No delivery found for this Tracking ID." };
        }

        const currentRouteIndex = delivery.currentRouteIndex ?? 0;
        const currentRoute = delivery.routes[currentRouteIndex] || null;
        const nextRoute = delivery.routes[currentRouteIndex + 1] || null;

        const totalCheckpoints = delivery.routes.length;
        const passedCheckpoints = currentRouteIndex;
        const progressPercentage = totalCheckpoints > 0 
            ? Math.round((passedCheckpoints / totalCheckpoints) * 100)
            : 0;

        console.log("=== TRACK ORDER DEBUG ===");
        console.log("Current Route Index:", currentRouteIndex);
        console.log("Current Route:", currentRoute?.cityName || currentRoute?.countryName);
        console.log("Passed Checkpoints (should equal currentRouteIndex):", passedCheckpoints);
        console.log("Total Checkpoints:", totalCheckpoints);
        console.log("Progress Percentage:", progressPercentage + "%");

        let animationProgress = 0;
        if (delivery.status === "IN_TRANSIT" && delivery.lastRouteUpdate && currentRoute && nextRoute) {
            const now = new Date().getTime();
            const lastUpdate = new Date(delivery.lastRouteUpdate).getTime();
            const timeSinceUpdate = (now - lastUpdate) / 1000 / 60 / 60; 
            
            const distance = nextRoute.distanceFromPrevious || 0;
            const speed = delivery.transitSpeed || 60; // km/h
            const estimatedTime = distance / speed; // hours
            
            animationProgress = Math.min(timeSinceUpdate / estimatedTime, 1);
        }

        // Serialize the delivery data
        return {
            success: true,
            delivery: {
                id: delivery.id,
                trackingId: delivery.trackingId,
                status: delivery.status,
                packageDescription: delivery.packageDescription,
                statusReason: delivery.statusReason,
                senderName: delivery.senderName,
                senderPhone: delivery.senderPhone,
                receiverName: delivery.receiverName,
                receiverPhone: delivery.receiverPhone,
                pickupAddress: delivery.pickupAddress,
                deliveryAddress: delivery.deliveryAddress,
                weight: delivery.weight,
                originCountry: delivery.originCountry,
                destinationCountry: delivery.destinationCountry,
                createdAt: delivery.createdAt.toISOString(),
                updatedAt: delivery.updatedAt.toISOString(),
                arrivalDate: delivery.arrivalDate?.toISOString() || null,
                estimatedArrival: delivery.estimatedArrival?.toISOString() || null,
                
                transitSpeed: delivery.transitSpeed,
                currentRouteIndex: delivery.currentRouteIndex,
                lastRouteUpdate: delivery.lastRouteUpdate?.toISOString() || null,
                animationProgress: animationProgress,
                
                currentLocation: {
                    name: currentRoute?.cityName || currentRoute?.countryName || delivery.pickupAddress,
                    coordinates: delivery.currentLatitude && delivery.currentLongitude
                        ? {
                            latitude: delivery.currentLatitude,
                            longitude: delivery.currentLongitude,
                        }
                        : currentRoute 
                            ? {
                                latitude: currentRoute.latitude,
                                longitude: currentRoute.longitude,
                            }
                            : null,
                    country: currentRoute?.countryName || delivery.originCountry,
                    countryCode: currentRoute?.countryCode || delivery.originCountry,
                    city: currentRoute?.cityName || null,
                    passedAt: currentRoute?.passedAt?.toISOString() || null,
                    sequence: currentRoute?.sequence || 0,
                },

                nextLocation: nextRoute
                    ? {
                        name: nextRoute.cityName || nextRoute.countryName,
                        coordinates: {
                            latitude: nextRoute.latitude,
                            longitude: nextRoute.longitude,
                        },
                        country: nextRoute.countryName,
                        countryCode: nextRoute.countryCode,
                        city: nextRoute.cityName || null,
                        sequence: nextRoute.sequence,
                        distance: nextRoute.distanceFromPrevious,
                        estimatedArrivalTime: nextRoute.estimatedArrivalTime?.toISOString() || null,
                    }
                    : {
                        name: delivery.deliveryAddress,
                        coordinates: null,
                        country: delivery.destinationCountry,
                        countryCode: delivery.destinationCountry,
                        city: null,
                        sequence: totalCheckpoints + 1,
                        distance: null,
                        estimatedArrivalTime: null,
                    },

                routeProgress: {
                    totalCheckpoints,
                    passedCheckpoints, // This is now currentRouteIndex
                    remainingCheckpoints: totalCheckpoints - passedCheckpoints,
                    progressPercentage,
                },

                routes: delivery.routes.map(route => ({
                    id: route.id,
                    countryCode: route.countryCode,
                    countryName: route.countryName,
                    cityName: route.cityName,
                    latitude: route.latitude,
                    longitude: route.longitude,
                    sequence: route.sequence,
                    isPassed: route.isPassed,
                    passedAt: route.passedAt?.toISOString() || null,
                    estimatedArrivalTime: route.estimatedArrivalTime?.toISOString() || null,
                    actualArrivalTime: route.actualArrivalTime?.toISOString() || null,
                    distanceFromPrevious: route.distanceFromPrevious,
                })),

                trackingHistory: delivery.trackingHistory.map(history => ({
                    id: history.id,
                    status: history.status,
                    location: history.location,
                    latitude: history.latitude,
                    longitude: history.longitude,
                    countryCode: history.countryCode,
                    description: history.description,
                    timestamp: history.timestamp.toISOString(),
                })),
            },
        };
    } catch (error) {
        console.error("Error searching for delivery:", error);
        return { error: "Something went wrong. Try again later." };
    }
};