"use client";

import { useState, useEffect } from "react";
import { CardWrapper } from "./auth/CardWrapper";
import { findDeliveryByTrackingId } from "@/actions/trackOrder";
import { DeliveryInfoCard } from "./tracking/DeliveryInfoCard";
import { RouteMapCanvas } from "./tracking/RouteMapCanvas";
import { VerticalTimeline } from "./tracking/VerticalTimeline";

import "@/styles/TrackingForm.scss";

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
                        <DeliveryInfoCard delivery={result.delivery} />
                        
                        {result.delivery.routes.length > 0 && (
                            <RouteMapCanvas 
                                delivery={result.delivery} 
                                animatedPosition={animatedPosition} 
                            />
                        )}

                        <VerticalTimeline delivery={result.delivery} />
                    </>
                )}
            </form>
        </CardWrapper>
    );
};