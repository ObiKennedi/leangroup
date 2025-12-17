"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

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
};

type DeliveryResult = {
    status: string;
    routes: RoutePoint[];
    currentRouteIndex: number | null;
};

interface RouteMapCanvasProps {
    delivery: DeliveryResult;
    animatedPosition: { lat: number; lng: number } | null;
}

export const RouteMapCanvas = ({ delivery, animatedPosition }: RouteMapCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !delivery.routes.length) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Setup canvas dimensions
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const width = rect.width;
        const height = rect.height;
        ctx.clearRect(0, 0, width, height);

        const routes = delivery.routes;
        
        // Calculate map bounds
        const lats = routes.map(r => r.latitude);
        const lngs = routes.map(r => r.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const padding = 50;
        const latRange = maxLat - minLat || 1;
        const lngRange = maxLng - minLng || 1;

        // Convert lat/lng to canvas coordinates
        const toCanvas = (lat: number, lng: number) => ({
            x: padding + ((lng - minLng) / lngRange) * (width - 2 * padding),
            y: height - (padding + ((lat - minLat) / latRange) * (height - 2 * padding))
        });

        // Draw all route lines (dashed - future path)
        ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        routes.forEach((route, i) => {
            const { x, y } = toCanvas(route.latitude, route.longitude);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw completed route segments (solid - traveled path)
        const currentIndex = delivery.currentRouteIndex ?? 0;
        if (currentIndex > 0) {
            ctx.strokeStyle = "rgba(212, 175, 55, 1)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            routes.slice(0, currentIndex + 1).forEach((route, i) => {
                const { x, y } = toCanvas(route.latitude, route.longitude);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

        // Draw checkpoint circles
        routes.forEach((route, i) => {
            const { x, y } = toCanvas(route.latitude, route.longitude);
            const isPassed = i < currentIndex;

            // Draw checkpoint circle
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = isPassed ? "#D4AF37" : "rgba(212, 175, 55, 0.3)";
            ctx.fill();
            ctx.strokeStyle = isPassed ? "#E6C76F" : "rgba(212, 175, 55, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw checkpoint number
            ctx.fillStyle = isPassed ? "#0B1A2A" : "rgba(230, 199, 111, 0.8)";
            ctx.font = "bold 10px Inter";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(route.sequence), x, y);
        });

        // Draw current location marker (animated blue dot)
        if (delivery.status === "IN_TRANSIT" && animatedPosition) {
            const { x, y } = toCanvas(animatedPosition.lat, animatedPosition.lng);

            // Inner pulsing circle
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, 2 * Math.PI);
            ctx.fillStyle = "#4A90E2";
            ctx.fill();

            // Outer glow ring
            ctx.beginPath();
            ctx.arc(x, y, 18, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(74, 144, 226, 0.5)";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }, [delivery, animatedPosition]);

    return (
        <div className="route-map-container">
            <div className="map-header">
                <MapPin className="header-icon" />
                <h3>Delivery Route Map</h3>
                {delivery.status === "IN_TRANSIT" && (
                    <span className="live-badge">
                        <span className="live-dot"></span>
                        LIVE
                    </span>
                )}
            </div>
            <canvas ref={canvasRef} className="route-canvas"></canvas>
        </div>
    );
};