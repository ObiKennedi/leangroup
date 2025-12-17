"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Plane, ArrowRight, CheckCircle2, Clock } from "lucide-react";

type DeliveryStatus =
    | "PENDING"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "CUSTOMS_CLEARANCE"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

interface RoutePoint {
    id: string;
    countryCode: string;
    countryName: string;
    cityName: string | null;
    latitude: number;
    longitude: number;
    sequence: number;
    isPassed: boolean;
    passedAt: string | null;
    estimatedArrivalTime?: string | null;
    checkpointActivity?: string | null;
}

interface Order {
    id: string;
    trackingId: string;
    senderName: string;
    senderPhone: string;
    pickupAddress: string;
    receiverName: string;
    receiverPhone: string;
    deliveryAddress: string;
    weight: number;
    originCountry: string;
    destinationCountry: string;
    estimatedArrival?: Date | null;
    status: DeliveryStatus;
    statusReason?: string | null;
    currentLocation?: string | null;
    currentLatitude?: number | null;
    currentLongitude?: number | null;
    currentRouteIndex: number | null;
    packageDescription?: string | null;
    routes: RoutePoint[];
}

interface TrackingEntry {
    id: string;
    status: DeliveryStatus;
    location: string;
    timestamp: Date;
    description?: string | null;
}

interface OrderDetailsModalProps {
    order: Order;
    trackingHistory?: TrackingEntry[];
}

export default function OrderDetailsModal({ order: initialOrder, trackingHistory }: OrderDetailsModalProps) {
    const [order, setOrder] = useState(initialOrder);
    const [showRoutes, setShowRoutes] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(order.currentRouteIndex ?? 0);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateLocation = async (newRouteIndex: number) => {
        console.log("🚀 ADMIN: Button clicked!");
        console.log("Order ID:", order.id);
        console.log("Current Index:", order.currentRouteIndex);
        console.log("Moving to Index:", newRouteIndex);

        setUpdating(true);
        setMessage(null);

        try {
            console.log("📡 Calling API...");

            const response = await fetch("/api/admin/update-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id, newRouteIndex })
            });

            console.log("📥 Response status:", response.status);
            console.log("📥 Response ok:", response.ok);

            const data = await response.json();

            console.log("📦 Response data:", data);

            if (response.ok && data.success) {
                setMessage({ type: 'success', text: data.message || 'Location updated successfully!' });

                // Refresh the order data
                const refreshResponse = await fetch(`/api/orders/${order.id}`);
                if (refreshResponse.ok) {
                    const updatedOrder = await refreshResponse.json();
                    console.log("✅ Order refreshed:", {
                        currentRouteIndex: updatedOrder.currentRouteIndex,
                        currentLocation: updatedOrder.currentLocation
                    });
                    setOrder(updatedOrder);
                    setSelectedRouteIndex(newRouteIndex);
                }

                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error(data.error || 'Failed to update location');
            }
        } catch (error) {
            console.error("💥 ERROR:", error);
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to update location'
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleMoveToNext = () => {
        const currentIndex = order.currentRouteIndex ?? 0;
        const nextIndex = currentIndex + 1;

        if (nextIndex < order.routes.length) {
            handleUpdateLocation(nextIndex);
        }
    };

    const handleMoveToLocation = () => {
        if (selectedRouteIndex !== order.currentRouteIndex) {
            handleUpdateLocation(selectedRouteIndex);
        }
    };

    const currentIndex = order.currentRouteIndex ?? 0;
    const canMoveNext = currentIndex < order.routes.length - 1;
    const currentRoute = order.routes[currentIndex];
    const nextRoute = canMoveNext ? order.routes[currentIndex + 1] : null;

    return (
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Status Message */}
            {message && (
                <div style={{
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    border: `2px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    {message.text}
                </div>
            )}

            {/* Basic Order Details */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                marginBottom: "24px"
            }}>
                <h2 style={{ marginBottom: "24px", color: "#0B1A2A" }}>
                    Order Details - {order.trackingId}
                </h2>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                    marginBottom: "24px"
                }}>
                    <div>
                        <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#666" }}>Sender Information</h3>
                        <p><strong>Name:</strong> {order.senderName}</p>
                        <p><strong>Phone:</strong> {order.senderPhone}</p>
                        <p><strong>Address:</strong> {order.pickupAddress}</p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#666" }}>Receiver Information</h3>
                        <p><strong>Name:</strong> {order.receiverName}</p>
                        <p><strong>Phone:</strong> {order.receiverPhone}</p>
                        <p><strong>Address:</strong> {order.deliveryAddress}</p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#666" }}>Shipment Details</h3>
                        <p><strong>Weight:</strong> {order.weight} kg</p>
                        <p><strong>Origin:</strong> {order.originCountry}</p>
                        <p><strong>Destination:</strong> {order.destinationCountry}</p>
                        {order.packageDescription && (
                            <p><strong>Description:</strong> {order.packageDescription}</p>
                        )}
                    </div>

                    <div>
                        <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#666" }}>Current Status</h3>
                        <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{order.status.replace(/_/g, " ")}</span></p>
                        {order.statusReason && (
                            <p style={{ color: "#4A90E2", fontWeight: "bold", marginTop: "8px" }}>
                                {order.statusReason}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Control Panel */}
            <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                marginBottom: "24px",
                color: "white"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <Plane size={28} />
                    <h2 style={{ margin: 0 }}>Location Control Panel</h2>
                </div>

                {/* Current Location Info */}
                <div style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px",
                    backdropFilter: "blur(10px)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                            <p style={{ fontSize: "14px", opacity: 0.9, margin: 0 }}>Current Location</p>
                            <h3 style={{ margin: "4px 0", fontSize: "20px" }}>
                                {currentRoute.cityName || currentRoute.countryName}
                            </h3>
                            <p style={{ fontSize: "14px", opacity: 0.8, margin: 0 }}>
                                {currentRoute.countryName} ({currentRoute.countryCode})
                            </p>
                        </div>
                        <div style={{
                            background: "#10b981",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "bold"
                        }}>
                            Checkpoint {currentIndex + 1} of {order.routes.length}
                        </div>
                    </div>
                </div>

                {/* Quick Move to Next */}
                {nextRoute && (
                    <div style={{
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "20px",
                        backdropFilter: "blur(10px)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "200px" }}>
                                <p style={{ fontSize: "14px", opacity: 0.9, margin: 0 }}>Next Destination</p>
                                <h4 style={{ margin: "4px 0", fontSize: "18px" }}>
                                    {nextRoute.cityName || nextRoute.countryName}
                                </h4>
                                <p style={{ fontSize: "14px", opacity: 0.8, margin: 0 }}>
                                    {nextRoute.countryName} ({nextRoute.countryCode})
                                </p>
                            </div>
                            <ArrowRight size={24} style={{ opacity: 0.6 }} />
                            <button
                                onClick={handleMoveToNext}
                                disabled={updating || !canMoveNext}
                                style={{
                                    background: canMoveNext && !updating ? "#10b981" : "#6b7280",
                                    color: "white",
                                    border: "none",
                                    padding: "12px 24px",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    cursor: canMoveNext && !updating ? "pointer" : "not-allowed",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "all 0.3s ease",
                                    opacity: updating ? 0.7 : 1
                                }}
                            >
                                <Plane size={20} />
                                {updating ? "Moving..." : "Move Here"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Route Selector Dropdown */}
                <div>
                    <button
                        onClick={() => setShowRoutes(!showRoutes)}
                        disabled={updating}
                        style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.2)",
                            border: "2px solid rgba(255,255,255,0.3)",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: updating ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.3s ease",
                            opacity: updating ? 0.7 : 1
                        }}
                    >
                        <span>Select Any Checkpoint</span>
                        {showRoutes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {showRoutes && (
                        <div style={{
                            marginTop: "12px",
                            background: "white",
                            borderRadius: "8px",
                            padding: "16px",
                            maxHeight: "400px",
                            overflowY: "auto"
                        }}>
                            {order.routes.map((route, index) => {
                                const isPassed = route.isPassed;
                                const isCurrent = index === currentIndex;
                                const isSelected = index === selectedRouteIndex;

                                return (
                                    <div
                                        key={route.id}
                                        onClick={() => !updating && setSelectedRouteIndex(index)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "12px",
                                            marginBottom: "8px",
                                            borderRadius: "8px",
                                            cursor: updating ? "not-allowed" : "pointer",
                                            background: isSelected ? "#e0f2fe" : isPassed ? "#f0fdf4" : "#f9fafb",
                                            border: `2px solid ${isSelected ? "#0ea5e9" : isPassed ? "#10b981" : "#e5e7eb"}`,
                                            transition: "all 0.2s ease",
                                            opacity: updating ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            background: isPassed ? "#10b981" : "#e5e7eb",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: isPassed ? "white" : "#666",
                                            fontWeight: "bold",
                                            flexShrink: 0
                                        }}>
                                            {isPassed ? <CheckCircle2 size={20} /> : route.sequence}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                <p style={{
                                                    margin: 0,
                                                    fontWeight: "bold",
                                                    color: "#0B1A2A",
                                                    fontSize: "15px"
                                                }}>
                                                    {route.cityName || route.countryName}
                                                </p>
                                                {isCurrent && (
                                                    <span style={{
                                                        background: "#4A90E2",
                                                        color: "white",
                                                        padding: "2px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "11px",
                                                        fontWeight: "bold"
                                                    }}>
                                                        CURRENT
                                                    </span>
                                                )}
                                                {index === 0 && (
                                                    <span style={{
                                                        background: "#10b981",
                                                        color: "white",
                                                        padding: "2px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "11px",
                                                        fontWeight: "bold"
                                                    }}>
                                                        ORIGIN
                                                    </span>
                                                )}
                                                {index === order.routes.length - 1 && (
                                                    <span style={{
                                                        background: "#ef4444",
                                                        color: "white",
                                                        padding: "2px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "11px",
                                                        fontWeight: "bold"
                                                    }}>
                                                        DESTINATION
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{
                                                margin: "4px 0 0 0",
                                                fontSize: "13px",
                                                color: "#666"
                                            }}>
                                                {route.countryCode} • Checkpoint {route.sequence}
                                            </p>
                                            {route.checkpointActivity && (
                                                <p style={{
                                                    margin: "4px 0 0 0",
                                                    fontSize: "12px",
                                                    color: "#4A90E2",
                                                    fontStyle: "italic"
                                                }}>
                                                    {route.checkpointActivity}
                                                </p>
                                            )}
                                        </div>
                                        <MapPin size={20} style={{ color: "#666", flexShrink: 0 }} />
                                    </div>
                                );
                            })}

                            {selectedRouteIndex !== currentIndex && (
                                <button
                                    onClick={handleMoveToLocation}
                                    disabled={updating}
                                    style={{
                                        width: "100%",
                                        background: updating ? "#9ca3af" : "#667eea",
                                        color: "white",
                                        border: "none",
                                        padding: "14px",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        cursor: updating ? "not-allowed" : "pointer",
                                        marginTop: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        transition: "all 0.3s ease",
                                        opacity: updating ? 0.7 : 1
                                    }}
                                >
                                    <Plane size={20} />
                                    {updating ? "Updating Location..." : `Move to Checkpoint ${selectedRouteIndex + 1}`}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Route Progress Summary */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                marginBottom: "24px"
            }}>
                <h3 style={{ marginBottom: "16px" }}>Route Progress</h3>
                <div style={{
                    display: "flex",
                    gap: "20px",
                    justifyContent: "space-around",
                    textAlign: "center",
                    flexWrap: "wrap"
                }}>
                    <div>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#10b981" }}>
                            {order.routes.filter(r => r.isPassed).length}
                        </div>
                        <div style={{ fontSize: "14px", color: "#666" }}>Completed</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#f59e0b" }}>
                            {order.routes.length - order.routes.filter(r => r.isPassed).length}
                        </div>
                        <div style={{ fontSize: "14px", color: "#666" }}>Remaining</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4A90E2" }}>
                            {Math.round((order.routes.filter(r => r.isPassed).length / order.routes.length) * 100)}%
                        </div>
                        <div style={{ fontSize: "14px", color: "#666" }}>Complete</div>
                    </div>
                </div>
            </div>

            {/* Tracking History */}
            {trackingHistory && trackingHistory.length > 0 && (
                <div style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                    <h3 style={{ marginBottom: "16px" }}>Tracking History</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {trackingHistory.map((entry) => (
                            <div key={entry.id} style={{
                                display: "flex",
                                gap: "16px",
                                padding: "16px",
                                background: "#f9fafb",
                                borderRadius: "8px",
                                borderLeft: "4px solid #4A90E2"
                            }}>
                                <div style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "50%",
                                    background: "#4A90E2",
                                    marginTop: "4px",
                                    flexShrink: 0
                                }}></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        margin: "0 0 4px 0",
                                        fontWeight: "bold",
                                        color: "#0B1A2A",
                                        textTransform: "capitalize"
                                    }}>
                                        {entry.status.replace(/_/g, " ")}
                                    </p>
                                    <p style={{ margin: "0 0 4px 0", color: "#666" }}>
                                        {entry.location}
                                    </p>
                                    {entry.description && (
                                        <p style={{ margin: "0 0 4px 0", color: "#4A90E2", fontSize: "14px" }}>
                                            {entry.description}
                                        </p>
                                    )}
                                    <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>
                                        <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}