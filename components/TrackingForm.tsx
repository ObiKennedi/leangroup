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

                        {/* Animated Location Tracker */}
                        <div className="location-tracker">
                            <div className="tracker-header">
                                <Navigation className="header-icon" />
                                <h3>Live Tracking</h3>
                                {result.delivery.status === "IN_TRANSIT" && (
                                    <Truck className="truck-icon" />
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="progress-container">
                                <div className="progress-info">
                                    <span className="progress-label">Journey Progress</span>
                                    <span className="progress-percentage">
                                        {result.delivery.routeProgress.progressPercentage}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${result.delivery.routeProgress.progressPercentage}%` }}
                                    >
                                        <div className="progress-glow"></div>
                                    </div>
                                </div>
                                <div className="checkpoint-info">
                                    <span>{result.delivery.routeProgress.passedCheckpoints} of {result.delivery.routeProgress.totalCheckpoints} checkpoints passed</span>
                                </div>
                            </div>

                            {/* Current and Next Location */}
                            <div className="locations-container">
                                {/* Current Location */}
                                <div className="location-card current">
                                    <div className="location-icon">
                                        {result.delivery.status === "IN_TRANSIT" ? (
                                            <Truck className="icon" />
                                        ) : (
                                            <MapPin className="icon" />
                                        )}
                                        <div className="icon-pulse"></div>
                                    </div>
                                    <div className="location-content">
                                        <div className="location-badge">
                                            <CheckCircle2 className="badge-icon" />
                                            Current Location
                                        </div>
                                        <h4 className="location-name">{result.delivery.currentLocation.name}</h4>
                                        <div className="location-details">
                                            <span className="detail-item">
                                                📍 {result.delivery.currentLocation.country}
                                            </span>
                                            {result.delivery.currentLocation.city && (
                                                <span className="detail-item">
                                                    🏙️ {result.delivery.currentLocation.city}
                                                </span>
                                            )}
                                            {result.delivery.currentLocation.coordinates && (
                                                <span className="detail-item coords">
                                                    {result.delivery.currentLocation.coordinates.latitude.toFixed(4)}, {result.delivery.currentLocation.coordinates.longitude.toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                        {result.delivery.currentLocation.passedAt && (
                                            <div className="timestamp">
                                                <Clock className="time-icon" />
                                                {formatDate(result.delivery.currentLocation.passedAt)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow Separator */}
                                <div className="location-separator">
                                    <ArrowRight className="arrow-icon" />
                                    <div className="separator-line"></div>
                                    {result.delivery.nextLocation.distance && (
                                        <span className="distance-badge">
                                            {result.delivery.nextLocation.distance.toFixed(0)} km
                                        </span>
                                    )}
                                </div>

                                {/* Next Location */}
                                <div className="location-card next">
                                    <div className="location-icon">
                                        <Package className="icon" />
                                        <div className="icon-glow"></div>
                                    </div>
                                    <div className="location-content">
                                        <div className="location-badge next-badge">
                                            <Navigation className="badge-icon" />
                                            Next Destination
                                        </div>
                                        <h4 className="location-name">{result.delivery.nextLocation.name}</h4>
                                        <div className="location-details">
                                            <span className="detail-item">
                                                📍 {result.delivery.nextLocation.country}
                                            </span>
                                            {result.delivery.nextLocation.city && (
                                                <span className="detail-item">
                                                    🏙️ {result.delivery.nextLocation.city}
                                                </span>
                                            )}
                                            {result.delivery.nextLocation.coordinates && (
                                                <span className="detail-item coords">
                                                    {result.delivery.nextLocation.coordinates.latitude.toFixed(4)}, {result.delivery.nextLocation.coordinates.longitude.toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                        {result.delivery.nextLocation.estimatedArrivalTime && (
                                            <div className="timestamp">
                                                <Clock className="time-icon" />
                                                ETA: {formatDate(result.delivery.nextLocation.estimatedArrivalTime)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* All Checkpoints Grid */}
                            {result.delivery.routes.length > 0 && (
                                <div className="checkpoints-grid">
                                    <h4 className="checkpoints-header">
                                        <Box className="header-icon" />
                                        All Checkpoints ({result.delivery.routes.length})
                                    </h4>
                                    <div className="checkpoints-list">
                                        {result.delivery.routes.map((route) => (
                                            <div
                                                key={route.id}
                                                className={`checkpoint-card ${route.isPassed ? 'passed' : 'upcoming'} ${route.sequence === (result.delivery!.currentRouteIndex ?? 0) + 1 ? 'current' : ''
                                                    }`}
                                            >
                                                <div className="checkpoint-marker">
                                                    {route.isPassed ? (
                                                        <CheckCircle2 className="marker-icon" />
                                                    ) : route.sequence === (result.delivery!.currentRouteIndex ?? 0) + 1 ? (
                                                        <Truck className="marker-icon" />
                                                    ) : (
                                                        <div className="marker-dot">{route.sequence}</div>
                                                    )}
                                                </div>
                                                <div className="checkpoint-content">
                                                    <div className="checkpoint-title">
                                                        {route.cityName || route.countryName}
                                                    </div>
                                                    <div className="checkpoint-subtitle">
                                                        {route.countryName} ({route.countryCode})
                                                    </div>
                                                    {route.passedAt && (
                                                        <div className="checkpoint-time">
                                                            ✓ {formatDate(route.passedAt)}
                                                        </div>
                                                    )}
                                                    {!route.passedAt && route.estimatedArrivalTime && (
                                                        <div className="checkpoint-time eta">
                                                            ⏱ ETA: {formatDate(route.estimatedArrivalTime)}
                                                        </div>
                                                    )}
                                                    {route.distanceFromPrevious && (
                                                        <div className="checkpoint-distance">
                                                            📏 {route.distanceFromPrevious.toFixed(0)} km from previous
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tracking History */}
                            {result.delivery.trackingHistory.length > 0 && (
                                <div className="tracking-history">
                                    <h4 className="history-header">
                                        <Clock className="header-icon" />
                                        Recent Updates
                                    </h4>
                                    <div className="history-list">
                                        {result.delivery.trackingHistory.map((history) => (
                                            <div key={history.id} className="history-item">
                                                <div className="history-time">
                                                    {formatDate(history.timestamp)}
                                                </div>
                                                <div className="history-content">
                                                    <span className={`history-status ${getStatusColor(history.status)}`}>
                                                        {history.status.replace(/_/g, ' ')}
                                                    </span>
                                                    <p className="history-description">
                                                        {history.description || history.location}
                                                    </p>
                                                    {history.countryCode && (
                                                        <span className="history-location">
                                                            📍 {history.countryCode}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </form>
        </CardWrapper>
    );
};