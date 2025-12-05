"use client";

import { useState } from "react";
import { CardWrapper } from "./auth/CardWrapper";
import { findDeliveryByTrackingId } from "@/actions/trackOrder";

import "@/styles/TrackingForm.scss"

type DeliveryResult = {
    id: string;
    trackingId: string;
    status: string;
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    pickupAddress: string;
    deliveryAddress: string;
    weight: number;
    createdAt: string;
    updatedAt: string;
    arrivalDate: string | null;
};

type TrackingResponse = {
    success?: boolean;
    delivery?: DeliveryResult;
    error?: string;
};

export const TrackingForm = () => {
    const [result, setResult] = useState<TrackingResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAction = async (formData: FormData) => {
        setLoading(true);
        setResult(null);

        const trackingId = String(formData.get("trackingId") || "");

        const response = await findDeliveryByTrackingId({ trackingId });

        setResult(response);
        setLoading(false);
    };

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
            case "IN_TRANSIT":
                return "status-in-transit";
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

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Searching..." : "Track Delivery"}
                </button>

                {result?.error && (
                    <div className="error-box">
                        <p>❌ {result.error}</p>
                    </div>
                )}

                {result?.delivery && (
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
                                    {result.delivery.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="info-item">
                                <span className="label">Sender:</span>
                                <span className="value">{result.delivery.senderName}</span>
                            </div>

                            <div className="info-item">
                                <span className="label">Receiver:</span>
                                <span className="value">{result.delivery.receiverName}</span>
                            </div>

                            <div className="info-item">
                                <span className="label">From:</span>
                                <span className="value">{result.delivery.pickupAddress}</span>
                            </div>

                            <div className="info-item">
                                <span className="label">To:</span>
                                <span className="value">{result.delivery.deliveryAddress}</span>
                            </div>

                            <div className="info-item">
                                <span className="label">Weight:</span>
                                <span className="value">{result.delivery.weight} kg</span>
                            </div>

                            <div className="info-item">
                                <span className="label">Created:</span>
                                <span className="value">{formatDate(result.delivery.createdAt)}</span>
                            </div>

                            {result.delivery.arrivalDate && (
                                <div className="info-item">
                                    <span className="label">Expected by:</span>
                                    <span className="value highlight">
                                        {formatDate(result.delivery.arrivalDate)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </CardWrapper>
    );
};