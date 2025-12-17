"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/LocationUpdateModal.module.scss";

interface Route {
    id: string;
    sequence: number;
    cityName: string | null;
    countryName: string;
    latitude: number;
    longitude: number;
    isPassed: boolean;
}

interface LocationUpdateModalProps {
    orderId: string;
    onSubmit: () => void;
    onClose?: () => void;
}

export default function LocationUpdateModal({ 
    orderId,
    onSubmit,
    onClose 
}: LocationUpdateModalProps) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [currentRouteIndex, setCurrentRouteIndex] = useState<number>(0);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
    const [statusReason, setStatusReason] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchOrderData();
    }, [orderId]);

    const fetchOrderData = async () => {
        setIsFetching(true);
        console.log("Fetching order data for:", orderId);
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            
            console.log("Response status:", response.status);
            
            if (!response.ok) {
                throw new Error("Failed to fetch order data");
            }

            const data = await response.json();
            console.log("Order data received:", data);
            console.log("Routes found:", data.routes?.length || 0);
            
            if (data.routes && data.routes.length > 0) {
                setRoutes(data.routes);
                setCurrentRouteIndex(data.currentRouteIndex || 0);
                setSelectedRouteIndex(data.currentRouteIndex || 0);
                console.log("Routes set successfully");
            } else {
                console.warn("No routes found in response");
                setError("No routes found for this order");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load order data");
            console.error("Fetch order error:", err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedRouteIndex === currentRouteIndex) {
            setError("Please select a different location");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch("/api/admin/update-location", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId,
                    newRouteIndex: selectedRouteIndex,
                    customStatusReason: statusReason.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update location");
            }

            setSuccessMessage(data.message || "Location updated successfully!");
            
            // Call parent onSubmit to refresh data
            onSubmit();
            
            // Close modal after short delay
            setTimeout(() => {
                if (onClose) {
                    onClose();
                }
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Location update error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getLocationLabel = (route: Route, index: number) => {
        const location = route.cityName || route.countryName;
        const totalRoutes = routes.length;
        
        let label = `${index + 1}. ${location}`;
        
        if (index === 0) {
            label += " (Pickup Point)";
        } else if (index === totalRoutes - 1) {
            label += " (Final Destination)";
        } else if (index === totalRoutes - 2) {
            label += " (Out for Delivery)";
        } else {
            label += " (Transit)";
        }
        
        if (route.isPassed) {
            label += " ✓";
        }
        
        if (index === currentRouteIndex) {
            label += " (Current)";
        }
        
        return label;
    };

    if (isFetching) {
        return (
            <div className={styles.form}>
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: '#6b7280'
                }}>
                    <div style={{ 
                        fontSize: '14px',
                        marginBottom: '8px'
                    }}>
                        Loading routes...
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                </div>
            </div>
        );
    }

    if (!routes.length) {
        return (
            <div className={styles.form}>
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: '#dc2626',
                    backgroundColor: '#fee2e2',
                    borderRadius: '6px'
                }}>
                    No routes found for this order
                </div>
            </div>
        );
    }

    return (
        <div className={styles.form}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                Update Package Location
            </h3>

            {error && (
                <div style={{ 
                    color: '#dc2626', 
                    backgroundColor: '#fee2e2', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '16px',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

            {successMessage && (
                <div style={{ 
                    color: '#059669', 
                    backgroundColor: '#d1fae5', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '16px',
                    fontSize: '14px'
                }}>
                    {successMessage}
                </div>
            )}

            <div className={styles.formGroup}>
                <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Select New Location
                </label>
                <select
                    value={selectedRouteIndex}
                    onChange={(e) => {
                        setSelectedRouteIndex(Number(e.target.value));
                        setError(null);
                    }}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.6 : 1
                    }}
                >
                    {routes.map((route, index) => (
                        <option key={route.id} value={index}>
                            {getLocationLabel(route, index)}
                        </option>
                    ))}
                </select>
                <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginTop: '8px' 
                }}>
                    Current location: {routes[currentRouteIndex]?.cityName || routes[currentRouteIndex]?.countryName}
                </p>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Custom Status Reason (Optional)
                </label>
                <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    disabled={isLoading}
                    placeholder="e.g., Package held at customs for inspection"
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        cursor: isLoading ? 'not-allowed' : 'text',
                        opacity: isLoading ? 0.6 : 1
                    }}
                />
                <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginTop: '8px' 
                }}>
                    Leave empty to use the default status reason
                </p>
            </div>

            <div style={{ 
                marginTop: '20px', 
                padding: '12px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '6px',
                fontSize: '13px',
                color: '#4b5563'
            }}>
                <strong>Note:</strong> Updating the location will automatically update the delivery status, 
                tracking history, and mark all previous checkpoints as passed.
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '24px' 
            }}>
                <button 
                    className={styles.submitBtn} 
                    onClick={handleSubmit}
                    disabled={isLoading || selectedRouteIndex === currentRouteIndex}
                    style={{
                        flex: 1,
                        opacity: (isLoading || selectedRouteIndex === currentRouteIndex) ? 0.6 : 1,
                        cursor: (isLoading || selectedRouteIndex === currentRouteIndex) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? "Updating..." : "Update Location"}
                </button>
                
                {onClose && (
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}