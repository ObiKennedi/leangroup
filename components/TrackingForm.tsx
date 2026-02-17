"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentTrackingIdRef = useRef<string | null>(null);

    // Stable fetch function that doesn't change on re-renders
    const fetchDelivery = useCallback(async (trackingId: string) => {
        const response = await findDeliveryByTrackingId({ trackingId });
        setResult(response);
        return response;
    }, []);

    const handleAction = async (formData: FormData) => {
        // Stop any existing polling before starting a new search
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setLoading(true);
        setResult(null);
        setAnimatedPosition(null);

        const trackingId = String(formData.get("trackingId") || "");
        currentTrackingIdRef.current = trackingId;

        const response = await fetchDelivery(trackingId);
        setLoading(false);

        // Set initial animated position if in transit
        if (response.delivery?.status === "IN_TRANSIT" && response.delivery.currentLocation.coordinates) {
            setAnimatedPosition({
                lat: response.delivery.currentLocation.coordinates.latitude,
                lng: response.delivery.currentLocation.coordinates.longitude,
            });
        }
    };

    // Update animated position whenever animationProgress changes — no polling here
    useEffect(() => {
        const delivery = result?.delivery;
        if (!delivery || delivery.status !== "IN_TRANSIT") return;
        if (!delivery.currentLocation.coordinates || !delivery.nextLocation.coordinates) return;

        const current = delivery.currentLocation.coordinates;
        const next = delivery.nextLocation.coordinates;
        const progress = delivery.animationProgress;

        const lat = current.latitude + (next.latitude - current.latitude) * progress;
        const lng = current.longitude + (next.longitude - current.longitude) * progress;

        setAnimatedPosition({ lat, lng });
    }, [result?.delivery?.animationProgress]);

    // Polling effect — only depends on status and trackingId, not the full result object
    useEffect(() => {
        const delivery = result?.delivery;

        // Clear any existing interval first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Only poll when in transit
        if (!delivery || delivery.status !== "IN_TRANSIT") return;

        const trackingId = delivery.trackingId;

        intervalRef.current = setInterval(() => {
            fetchDelivery(trackingId);
        }, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [result?.delivery?.status, result?.delivery?.trackingId, fetchDelivery]);

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