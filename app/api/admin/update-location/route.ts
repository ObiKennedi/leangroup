import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DeliveryStatus } from "@prisma/client";

function getCheckpointActivity(routeIndex: number, totalRoutes: number, cityName: string | null, countryName: string): string {
    if (routeIndex === 0) {
        return `Package picked up from ${cityName || countryName}`;
    } else if (routeIndex === totalRoutes - 1) {
        return `Package delivered to ${cityName || countryName}`;
    } else {
        return `Package arrived at ${cityName || countryName}`;
    }
}

function getStatusReason(routeIndex: number, totalRoutes: number, cityName: string | null, countryName: string): string {
    if (routeIndex === 0) {
        return `Package has been picked up from ${cityName || countryName}`;
    } else if (routeIndex === totalRoutes - 1) {
        return `Package has been delivered to ${cityName || countryName}`;
    } else if (routeIndex === totalRoutes - 2) {
        return `Package is out for delivery to ${cityName || countryName}`;
    } else {
        return `Package is in transit at ${cityName || countryName}`;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { orderId, newRouteIndex, customStatusReason } = await req.json();

        console.log("=== 1. API CALLED ===");
        console.log("Order ID:", orderId);
        console.log("New Route Index:", newRouteIndex);
        console.log("Custom Status Reason:", customStatusReason || "(none provided)");

        const order = await db.delivery.findUnique({
            where: { id: orderId },
            include: { routes: { orderBy: { sequence: 'asc' } } }
        });

        if (!order) {
            console.log("❌ Order not found!");
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        console.log("=== 2. ORDER FOUND ===");
        console.log("Current Index in DB:", order.currentRouteIndex);
        console.log("Total Routes:", order.routes.length);

        const routes = order.routes;
        if (newRouteIndex < 0 || newRouteIndex >= routes.length) {
            console.log("❌ Invalid route index!");
            return NextResponse.json({ error: "Invalid route index" }, { status: 400 });
        }

        const newRoute = routes[newRouteIndex];
        const totalRoutes = routes.length;

        let newStatus: DeliveryStatus;
        
        if (newRouteIndex === 0) {
            newStatus = DeliveryStatus.PICKED_UP;
        } else if (newRouteIndex === totalRoutes - 1) {
            newStatus = DeliveryStatus.DELIVERED;
        } else if (newRouteIndex === totalRoutes - 2) {
            newStatus = DeliveryStatus.OUT_FOR_DELIVERY;
        } else {
            newStatus = DeliveryStatus.IN_TRANSIT;
        }

        // Use custom status reason if provided, otherwise use default
        const statusReason = customStatusReason || getStatusReason(newRouteIndex, totalRoutes, newRoute.cityName, newRoute.countryName);

        console.log("=== 3. STARTING TRANSACTION ===");
        console.log("Status Reason:", statusReason);

        await db.$transaction(async (tx) => {
            console.log("→ Resetting all routes...");
            
            // Reset all routes
            for (const route of routes) {
                await tx.route.update({
                    where: { id: route.id },
                    data: {
                        isPassed: false,
                        passedAt: null,
                        actualArrivalTime: null,
                        checkpointActivity: null,
                    }
                });
            }
            
            console.log("→ Marking passed routes...");

            // Mark routes before current as passed
            for (let i = 0; i < newRouteIndex; i++) {
                await tx.route.update({
                    where: { id: routes[i].id },
                    data: {
                        isPassed: true,
                        passedAt: new Date(Date.now() - (newRouteIndex - 1 - i) * 3600000),
                        actualArrivalTime: new Date(Date.now() - (newRouteIndex - 1 - i) * 3600000),
                        checkpointActivity: getCheckpointActivity(i, totalRoutes, routes[i].cityName, routes[i].countryName),
                    }
                });
            }

            console.log("→ Marking current route...");

            // Mark current route
            await tx.route.update({
                where: { id: newRoute.id },
                data: {
                    isPassed: false,
                    passedAt: new Date(),
                    actualArrivalTime: new Date(),
                    checkpointActivity: getCheckpointActivity(newRouteIndex, totalRoutes, newRoute.cityName, newRoute.countryName),
                }
            });

            console.log("→ Updating delivery...");
            console.log("   Setting currentRouteIndex to:", newRouteIndex);

            // Update delivery
            const updatedDelivery = await tx.delivery.update({
                where: { id: orderId },
                data: {
                    currentRouteIndex: newRouteIndex,
                    status: newStatus,
                    statusReason: statusReason,
                    currentLocation: `${newRoute.cityName || newRoute.countryName}, ${newRoute.countryName}`,
                    currentLatitude: newRoute.latitude,
                    currentLongitude: newRoute.longitude,
                    lastRouteUpdate: new Date(),
                    arrivalDate: newRouteIndex === totalRoutes - 1 ? new Date() : order.arrivalDate,
                }
            });

            console.log("   Updated delivery currentRouteIndex:", updatedDelivery.currentRouteIndex);

            console.log("→ Adding tracking history...");

            // Add tracking history
            await tx.trackingHistory.create({
                data: {
                    deliveryId: orderId,
                    status: newStatus,
                    location: `${newRoute.cityName || newRoute.countryName}, ${newRoute.countryName}`,
                    latitude: newRoute.latitude,
                    longitude: newRoute.longitude,
                    countryCode: newRoute.countryCode,
                    description: statusReason,
                }
            });
        }, {
            maxWait: 5000,
            timeout: 10000,
        });

        console.log("=== 4. TRANSACTION COMPLETE ===");

        // Verify the update
        const verifiedOrder = await db.delivery.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                trackingId: true,
                currentRouteIndex: true,
                currentLocation: true,
                status: true,
                statusReason: true
            }
        });

        console.log("=== 5. VERIFICATION ===");
        console.log("Database now shows:");
        console.log("  currentRouteIndex:", verifiedOrder?.currentRouteIndex);
        console.log("  currentLocation:", verifiedOrder?.currentLocation);
        console.log("  status:", verifiedOrder?.status);
        console.log("  statusReason:", verifiedOrder?.statusReason);
        console.log("Expected currentRouteIndex:", newRouteIndex);
        console.log("Match?", verifiedOrder?.currentRouteIndex === newRouteIndex ? "✅ YES" : "❌ NO");

        return NextResponse.json({ 
            success: true,
            message: `Location updated to ${newRoute.cityName || newRoute.countryName}`,
            status: newStatus,
            statusReason: statusReason,
            currentRouteIndex: newRouteIndex,
            verified: verifiedOrder?.currentRouteIndex === newRouteIndex
        });
    } catch (error) {
        console.error("💥 ERROR:", error);
        return NextResponse.json({ 
            error: "Failed to update location",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}