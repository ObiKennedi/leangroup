"use client";

import { useState, useEffect, useRef } from "react";
import { CardWrapper } from "./auth/CardWrapper";
import { findDeliveryByTrackingId } from "@/actions/trackOrder";
import { MapPin, Package, ArrowRight, CheckCircle2, Clock, Navigation, Truck, Box } from "lucide-react";

import "@/styles/TrackingForm.scss"

type RoutePoint = {
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
    actualArrivalTime?: string | null;
    distanceFromPrevious?: number | null;
};

type Location = {
    name: string;
    coordinates: {
        latitude: number;
        longitude: number;
    } | null;
    country: string;
    countryCode: string;
    city: string | null;
    passedAt?: string | null;
    sequence?: number;
    distance?: number | null;
    estimatedArrivalTime?: string | null;
};

type DeliveryResult = {
    id: string;
    trackingId: string;
    status: string;
    packageDescription: string | null;
    statusReason: string | null;
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    pickupAddress: string;
    deliveryAddress: string;
    weight: number;
    originCountry: string;
    destinationCountry: string;
    createdAt: string;
    updatedAt: string;
    arrivalDate: string | null;
    estimatedArrival: string | null;
    transitSpeed: number | null;
    currentRouteIndex: number | null;
    lastRouteUpdate: string | null;
    animationProgress: number;
    currentLocation: Location;
    nextLocation: Location;
    routeProgress: {
        totalCheckpoints: number;
        passedCheckpoints: number;
        remainingCheckpoints: number;
        progressPercentage: number;
    };
    routes: RoutePoint[];
    trackingHistory: Array<{
        id: string;
        status: string;
        location: string;
        latitude: number | null;
        longitude: number | null;
        countryCode: string | null;
        description: string | null;
        timestamp: string;
    }>;
};

type TrackingResponse = {
    success?: boolean;
    delivery?: DeliveryResult;
    error?: string;
};

export const TrackingForm = () => {
    const [result, setResult] = useState<TrackingResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [animatedPosition, setAnimatedPosition] = useState<{ lat: number; lng: number } | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleAction = async (formData: FormData) => {
        setLoading(true);
        setResult(null);
        setAnimatedPosition(null);

        const trackingId = String(formData.get("trackingId") || "");
        const response = await findDeliveryByTrackingId({ trackingId });

        setResult(response);
        setLoading(false);

        // Initialize animated position if in transit
        if (response.delivery?.status === "IN_TRANSIT" && response.delivery.currentLocation.coordinates) {
            setAnimatedPosition({
                lat: response.delivery.currentLocation.coordinates.latitude,
                lng: response.delivery.currentLocation.coordinates.longitude,
            });
        }
    };

    // Animate position for IN_TRANSIT status
    useEffect(() => {
        if (!result?.delivery || result.delivery.status !== "IN_TRANSIT") return;
        if (!result.delivery.currentLocation.coordinates || !result.delivery.nextLocation.coordinates) return;

        const current = result.delivery.currentLocation.coordinates;
        const next = result.delivery.nextLocation.coordinates;
        const progress = result.delivery.animationProgress;

        // Interpolate position
        const lat = current.latitude + (next.latitude - current.latitude) * progress;
        const lng = current.longitude + (next.longitude - current.longitude) * progress;

        setAnimatedPosition({ lat, lng });

        // Update every 5 seconds for smooth animation
        const interval = setInterval(() => {
            const fd = new FormData();
            fd.append("trackingId", result.delivery!.trackingId);
            handleAction(fd);
        }, 5000);

        return () => clearInterval(interval);
    }, [result]);

    // Draw route map on canvas
    useEffect(() => {
        if (!canvasRef.current || !result?.delivery?.routes.length) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const routes = result.delivery.routes;
        if (routes.length === 0) return;

        // Calculate bounds
        const lats = routes.map(r => r.latitude);
        const lngs = routes.map(r => r.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Add padding
        const padding = 50;
        const latRange = maxLat - minLat || 1;
        const lngRange = maxLng - minLng || 1;

        // Convert lat/lng to canvas coordinates
        const toCanvas = (lat: number, lng: number) => {
            const x = padding + ((lng - minLng) / lngRange) * (width - 2 * padding);
            const y = height - (padding + ((lat - minLat) / latRange) * (height - 2 * padding));
            return { x, y };
        };

        // Draw route lines
        ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        routes.forEach((route, i) => {
            const { x, y } = toCanvas(route.latitude, route.longitude);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw passed route segments
        const currentIndex = result.delivery.currentRouteIndex ?? 0;
        if (currentIndex > 0) {
            ctx.strokeStyle = "rgba(212, 175, 55, 1)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            routes.slice(0, currentIndex + 1).forEach((route, i) => {
                const { x, y } = toCanvas(route.latitude, route.longitude);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        }

        // Draw checkpoints
        routes.forEach((route, i) => {
            const { x, y } = toCanvas(route.latitude, route.longitude);

            // Draw checkpoint circle
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = route.isPassed ? "#D4AF37" : "rgba(212, 175, 55, 0.3)";
            ctx.fill();
            ctx.strokeStyle = route.isPassed ? "#E6C76F" : "rgba(212, 175, 55, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw checkpoint number
            ctx.fillStyle = route.isPassed ? "#0B1A2A" : "rgba(230, 199, 111, 0.8)";
            ctx.font = "bold 10px Inter";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(route.sequence), x, y);
        });

        // Draw animated position for IN_TRANSIT
        if (result.delivery.status === "IN_TRANSIT" && animatedPosition) {
            const { x, y } = toCanvas(animatedPosition.lat, animatedPosition.lng);

            // Pulsing circle
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, 2 * Math.PI);
            ctx.fillStyle = "#4A90E2";
            ctx.fill();

            // Outer glow
            ctx.beginPath();
            ctx.arc(x, y, 18, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(74, 144, 226, 0.5)";
            ctx.lineWidth = 3;
            ctx.stroke();
        }

    }, [result, animatedPosition]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "status-pending";
            case "PICKED_UP":
                return "status-picked-up";
            case "IN_TRANSIT":
                return "status-in-transit";
            case "CUSTOMS_CLEARANCE":
                return "status-customs";
            case "OUT_FOR_DELIVERY":
                return "status-out-for-delivery";
            case "DELIVERED":
                return "status-delivered";
            case "CANCELLED":
                return "status-cancelled";
            default:
                return "";
        }
    };

    return (
        <CardWrapper
            headerLabel="Track your Order"
            headerWriteUp="Enter your tracking ID to check your delivery status."
        >
            <form action={handleAction} className="tracking-form">
                <div>
                    <label>Tracking ID</label>
                    <input
                        type="text"
                        name="trackingId"
                        required
                        placeholder="Enter tracking ID (e.g., TRK-XXXXXX)"
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Track Delivery"}
                </button>

                {result?.error && (
                    <div className="error-box">
                        <p>❌ {result.error}</p>
                    </div>
                )}

                {result?.delivery && (
                    <>
                        <div className="result-box">
                            <h3>✅ Delivery Found</h3>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label">Tracking ID:</span>
                                    <span className="value">{result.delivery.trackingId}</span>
                                </div>

                                <div className="info-item">
                                    <span className="label">Status:</span>
                                    <span className={`status-badge ${getStatusColor(result.delivery.status)}`}>
                                        {result.delivery.status.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                {result.delivery.packageDescription && (
                                    <div className="info-item">
                                        <span className="label">Package:</span>
                                        <span className="value">{result.delivery.packageDescription}</span>
                                    </div>
                                )}

                                {result.delivery.statusReason && (
                                    <div className="info-item full-width">
                                        <span className="label">Status Reason:</span>
                                        <span className="value highlight">{result.delivery.statusReason}</span>
                                    </div>
                                )}

                                <div className="info-item">
                                    <span className="label">Sender:</span>
                                    <span className="value">{result.delivery.senderName}</span>
                                </div>

                                <div className="info-item">
                                    <span className="label">Receiver:</span>
                                    <span className="value">{result.delivery.receiverName}</span>
                                </div>

                                <div className="info-item">
                                    <span className="label">Weight:</span>
                                    <span className="value">{result.delivery.weight} kg</span>
                                </div>

                                <div className="info-item">
                                    <span className="label">Created:</span>
                                    <span className="value">{formatDate(result.delivery.createdAt)}</span>
                                </div>

                                {result.delivery.estimatedArrival && (
                                    <div className="info-item">
                                        <span className="label">Expected by:</span>
                                        <span className="value highlight">
                                            {formatDate(result.delivery.estimatedArrival)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Route Map */}
                        {result.delivery.routes.length > 0 && (
                            <div className="route-map-container">
                                <div className="map-header">
                                    <MapPin className="header-icon" />
                                    <h3>Delivery Route Map</h3>
                                    {result.delivery.status === "IN_TRANSIT" && (
                                        <span className="live-badge">
                                            <span className="live-dot"></span>
                                            LIVE
                                        </span>
                                    )}
                                </div>
                                <canvas ref={canvasRef} className="route-canvas"></canvas>
                            </div>
                        )}

                        {/* Vertical Progress Timeline */}
                        <div className="vertical-timeline-container">
                                <div className="timeline-header">
                                    <Navigation className="header-icon" />
                                    <h3>Shipment Progress</h3>
                                    {result.delivery.status === "IN_TRANSIT" && (
                                        <span className="live-badge">
                                            <span className="live-dot"></span>
                                            LIVE
                                        </span>
                                    )}
                                </div>

                                <div className="vertical-timeline">
                                    {result.delivery.routes.map((route, index) => {
                                        const isPassed = route.isPassed;
                                        const isCurrent = index === (result.delivery!.currentRouteIndex ?? 0);
                                        const isLast = index === result.delivery!.routes.length - 1;

                                        return (
                                            <div key={route.id} className="timeline-step">
                                                <div className="timeline-left">
                                                    {/* Node/Checkpoint */}
                                                    <div className={`timeline-node ${isPassed ? 'passed' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                                                        {isPassed && !isCurrent ? (
                                                            <CheckCircle2 size={24} />
                                                        ) : isCurrent ? (
                                                            <Truck size={24} />
                                                        ) : (
                                                            <div className="node-circle"></div>
                                                        )}
                                                    </div>

                                                    {/* Vertical Line */}
                                                    {!isLast && (
                                                        <div className={`timeline-line ${isPassed && index < (result.delivery!.currentRouteIndex ?? 0) ? 'completed' : 'incomplete'}`}></div>
                                                    )}
                                                </div>

                                                <div className="timeline-right">
                                                    <div className={`timeline-card ${isPassed ? 'passed' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                                                        <div className="card-header">
                                                            <h4>{route.cityName || route.countryName}</h4>
                                                            {isCurrent && (
                                                                <span className="current-label">Current Location</span>
                                                            )}
                                                            {index === 0 && (
                                                                <span className="origin-label">Origin</span>
                                                            )}
                                                            {isLast && (
                                                                <span className="destination-label">Destination</span>
                                                            )}
                                                        </div>

                                                        <div className="card-details">
                                                            <div className="detail-row">
                                                                <MapPin size={16} />
                                                                <span>{route.countryName} ({route.countryCode})</span>
                                                            </div>

                                                            {route.passedAt && (
                                                                <div className="detail-row time-row">
                                                                    <CheckCircle2 size={16} />
                                                                    <span>{formatDate(route.passedAt)}</span>
                                                                </div>
                                                            )}

                                                            {!route.passedAt && route.estimatedArrivalTime && (
                                                                <div className="detail-row time-row eta">
                                                                    <Clock size={16} />
                                                                    <span>ETA: {formatDate(route.estimatedArrivalTime)}</span>
                                                                </div>
                                                            )}

                                                            {route.distanceFromPrevious && index > 0 && (
                                                                <div className="detail-row distance-row">
                                                                    <Navigation size={16} />
                                                                    <span>{route.distanceFromPrevious.toFixed(0)} km from previous</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Progress Summary */}
                                <div className="progress-summary">
                                    <div className="summary-item">
                                        <div className="summary-value">{result.delivery.routeProgress.passedCheckpoints}</div>
                                        <div className="summary-label">Completed</div>
                                    </div>
                                    <div className="summary-divider"></div>
                                    <div className="summary-item">
                                        <div className="summary-value">{result.delivery.routeProgress.remainingCheckpoints}</div>
                                        <div className="summary-label">Remaining</div>
                                    </div>
                                    <div className="summary-divider"></div>
                                    <div className="summary-item highlight">
                                        <div className="summary-value">{result.delivery.routeProgress.progressPercentage}%</div>
                                        <div className="summary-label">Complete</div>
                                    </div>
                                </div>
                            </div>
                        )                    
                    </>
                )}
            </form>
        </CardWrapper>
    );
};