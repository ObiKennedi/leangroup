"use client";

import { useState } from "react";
import { createOrder } from "@/actions/createOrder";
import { useSession } from "next-auth/react";
import OrderReceipt from "@/components/OrderReciept";
import "@/styles/CreateOrder.scss";

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
        name: string; phone: string; address: string;
    };
    receiver: {
        name: string; phone: string; address: string;
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

export default function CreateOrderForm() {
    const { data: session, status } = useSession();

    const [formData, setFormData] = useState({
        senderName: "",
        senderPhone: "",
        receiverName: "",
        receiverPhone: "",
        pickupAddress: "",
        deliveryAddress: "",
        weight: "",
        packageDescription: "",
        statusReason: "",
        originCountry: "",
        destinationCountry: "",
        estimatedArrival: "",
    });

    const [routes, setRoutes] = useState<RoutePoint[]>([]);
    const [showRouteForm, setShowRouteForm] = useState(false);
    const [currentRoute, setCurrentRoute] = useState({
        countryCode: "",
        countryName: "",
        cityName: "",
        latitude: "",
        longitude: "",
        estimatedArrivalTime: "",
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<null | {
        success: boolean; message: string; trackingId?: string; receipt?: Receipt;
    }>(null);
    const [showReceipt, setShowReceipt] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRouteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentRoute((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const addRoute = () => {
        if (
            currentRoute.countryCode &&
            currentRoute.countryName &&
            currentRoute.latitude &&
            currentRoute.longitude
        ) {
            setRoutes((prev) => [
                ...prev,
                {
                    countryCode: currentRoute.countryCode.toUpperCase(),
                    countryName: currentRoute.countryName,
                    cityName: currentRoute.cityName || undefined,
                    latitude: parseFloat(currentRoute.latitude),
                    longitude: parseFloat(currentRoute.longitude),
                    estimatedArrivalTime: currentRoute.estimatedArrivalTime
                        ? new Date(currentRoute.estimatedArrivalTime)
                        : undefined,
                },
            ]);
            setCurrentRoute({
                countryCode: "",
                countryName: "",
                cityName: "",
                latitude: "",
                longitude: "",
                estimatedArrivalTime: "",
            });
        }
    };

    const removeRoute = (index: number) => {
        setRoutes((prev) => prev.filter((_, i) => i !== index));
    };

    const getRouteLocationDisplay = (route: RoutePoint) => {
        const parts = [];
        if (route.cityName) parts.push(route.cityName);
        parts.push(route.countryName);
        return parts.join(", ");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const userId = session?.user?.id;

        if (status === "loading") {
            setLoading(false);
            return;
        }

        if (!userId) {
            setResult({
                success: false,
                message: "Authentication required. Please log in to create an order.",
            });
            setLoading(false);
            return;
        }

        const response = await createOrder(
            {
                senderName: formData.senderName,
                senderPhone: formData.senderPhone,
                receiverName: formData.receiverName,
                receiverPhone: formData.receiverPhone,
                pickupAddress: formData.pickupAddress,
                deliveryAddress: formData.deliveryAddress,
                weight: Number(formData.weight),
                packageDescription: formData.packageDescription || undefined,
                statusReason: formData.statusReason || undefined,
                originCountry: formData.originCountry,
                destinationCountry: formData.destinationCountry,
                routes: routes.length > 0 ? routes : undefined,
                estimatedArrival: formData.estimatedArrival
                    ? new Date(formData.estimatedArrival)
                    : undefined,
            },
            userId
        );

        if (response.success) {
            setResult({
                success: response.success,
                message: response.message,
                trackingId: response.trackingId || undefined,
                receipt: response.receipt,
            });

            if (response.receipt) {
                setShowReceipt(true);

                // Reset form on success
                setFormData({
                    senderName: "",
                    senderPhone: "",
                    receiverName: "",
                    receiverPhone: "",
                    pickupAddress: "",
                    deliveryAddress: "",
                    weight: "",
                    packageDescription: "",
                    statusReason: "",
                    originCountry: "",
                    destinationCountry: "",
                    estimatedArrival: "",
                });
                setRoutes([]);
            }
        } else {
            setResult({
                success: response.success,
                message: response.message,
            });
        }

        setLoading(false);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleCloseReceipt = () => {
        setShowReceipt(false);
    };

    if (status === "loading") {
        return (
            <div className="create-order">Loading authentication status...</div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="create-order">Please log in to create an order.</div>
        );
    }

    return (
        <div className="create-order">
            <h2>Create Order</h2>

            <form className="order-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Sender Name</label>
                    <input
                        type="text"
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Sender Phone</label>
                    <input
                        type="text"
                        name="senderPhone"
                        value={formData.senderPhone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Receiver Name</label>
                    <input
                        type="text"
                        name="receiverName"
                        value={formData.receiverName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Receiver Phone</label>
                    <input
                        type="text"
                        name="receiverPhone"
                        value={formData.receiverPhone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Pickup Address</label>
                    <textarea
                        name="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>Delivery Address</label>
                    <textarea
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>Weight (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        step="0.01"
                        value={formData.weight}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Package Description (Optional)</label>
                    <textarea
                        name="packageDescription"
                        placeholder="Describe the package contents..."
                        value={formData.packageDescription}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/*<div className="form-group">
                    <label>Status Reason (Optional)</label>
                    <input
                        type="text"
                        name="statusReason"
                        placeholder="e.g., Awaiting package pickup"
                        value={formData.statusReason}
                        onChange={handleChange}
                    />
                </div>*/}

                <div className="form-group">
                    <label>Origin Country</label>
                    <input
                        type="text"
                        name="originCountry"
                        placeholder="e.g., US, NG, UK"
                        value={formData.originCountry}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Destination Country</label>
                    <input
                        type="text"
                        name="destinationCountry"
                        placeholder="e.g., US, NG, UK"
                        value={formData.destinationCountry}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Estimated Arrival (Optional)</label>
                    <input
                        type="datetime-local"
                        name="estimatedArrival"
                        value={formData.estimatedArrival}
                        onChange={handleChange}
                    />
                </div>

                {/* Route Management Section */}
                <div className="route-section">
                    <div className="route-header">
                        <h3>Route Checkpoints (Optional)</h3>
                        <button
                            type="button"
                            className="toggle-route-btn"
                            onClick={() => setShowRouteForm(!showRouteForm)}
                        >
                            {showRouteForm ? "Hide" : "Add Routes"}
                        </button>
                    </div>

                    {showRouteForm && (
                        <div className="route-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Country Code</label>
                                    <input
                                        type="text"
                                        name="countryCode"
                                        placeholder="US"
                                        value={currentRoute.countryCode}
                                        onChange={handleRouteChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Country Name</label>
                                    <input
                                        type="text"
                                        name="countryName"
                                        placeholder="United States"
                                        value={currentRoute.countryName}
                                        onChange={handleRouteChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>City/Checkpoint (Optional)</label>
                                <input
                                    type="text"
                                    name="cityName"
                                    placeholder="New York"
                                    value={currentRoute.cityName}
                                    onChange={handleRouteChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        placeholder="40.7128"
                                        value={currentRoute.latitude}
                                        onChange={handleRouteChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        placeholder="-74.0060"
                                        value={currentRoute.longitude}
                                        onChange={handleRouteChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Estimated Arrival Time (Optional)</label>
                                <input
                                    type="datetime-local"
                                    name="estimatedArrivalTime"
                                    value={currentRoute.estimatedArrivalTime}
                                    onChange={handleRouteChange}
                                />
                            </div>

                            <button
                                type="button"
                                className="add-route-btn"
                                onClick={addRoute}
                            >
                                Add Checkpoint
                            </button>
                        </div>
                    )}

                    {routes.length > 0 && (
                        <div className="routes-list">
                            <h4>Added Routes ({routes.length})</h4>
                            {routes.map((route, index) => (
                                <div key={index} className="route-item">
                                    <span className="route-number">{index + 1}</span>
                                    <div className="route-details">
                                        <strong>{getRouteLocationDisplay(route)}</strong>
                                        <span className="route-coords">
                                            {route.countryCode} • ({route.latitude.toFixed(4)}, {route.longitude.toFixed(4)})
                                        </span>
                                        {route.estimatedArrivalTime && (
                                            <span className="route-eta">
                                                ETA: {new Date(route.estimatedArrivalTime).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-route-btn"
                                        onClick={() => removeRoute(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    className="submit-btn"
                    type="submit"
                    disabled={loading || status !== "authenticated"}
                >
                    {loading ? "Creating..." : "Create Order"}
                </button>
            </form>

            {result && !showReceipt && (
                <div
                    className={`status-message ${result.success ? "success" : "error"
                        }`}
                >
                    <p>{result.message}</p>
                    {result.trackingId && (
                        <p className="tracking">
                            Tracking ID: <strong>{result.trackingId}</strong>
                        </p>
                    )}
                </div>
            )}

            {/* Receipt Modal */}
            {showReceipt && result?.receipt && (
                <OrderReceipt
                    receipt={result.receipt}
                    onClose={handleCloseReceipt}
                    onPrint={handlePrintReceipt}
                />
            )}
        </div>
    );
}