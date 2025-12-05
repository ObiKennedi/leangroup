"use client";

import { useState, useEffect } from "react";
import { updateOrderStatus } from "@/actions/UpdateOrderStatus";
import styles from "@/styles/OrdersList.module.scss";

type DeliveryStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

type Order = {
    id: string;
    trackingId: string;
    weight: number;
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    pickupAddress: string;
    deliveryAddress: string;
    status: DeliveryStatus;
    arrivalDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        phoneNumber: string | null;
    };
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<DeliveryStatus | "ALL">("ALL");
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query params
            const params = new URLSearchParams();
            if (filterStatus !== "ALL") {
                params.append("status", filterStatus);
            }

            const response = await fetch(`/api/orders?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.statusText}`);
            }

            const data = await response.json();
            setOrders(data || []);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err instanceof Error ? err.message : "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const handleStatusUpdate = async (orderId: string, newStatus: DeliveryStatus) => {
        setUpdatingOrderId(orderId);
        const result = await updateOrderStatus(orderId, newStatus);

        if (result.success) {
            // Update the local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } else {
            alert(result.error || "Failed to update order status");
        }

        setUpdatingOrderId(null);
    };

    const getStatusColor = (status: DeliveryStatus) => {
        switch (status) {
            case "PENDING":
                return styles.statusPending;
            case "IN_TRANSIT":
                return styles.statusInTransit;
            case "DELIVERED":
                return styles.statusDelivered;
            case "CANCELLED":
                return styles.statusCancelled;
            default:
                return "";
        }
    };

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Error Loading Orders</h2>
                    <p>{error}</p>
                    <button onClick={fetchOrders} className={styles.retryButton}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Orders Management</h1>
                <div className={styles.filters}>
                    <label>Filter by Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as DeliveryStatus | "ALL")}
                        className={styles.filterSelect}
                        disabled={loading}
                    >
                        <option value="ALL">All Orders</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className={styles.empty}>
                    {filterStatus === "ALL"
                        ? "No orders found"
                        : `No ${filterStatus.toLowerCase()} orders found`}
                </div>
            ) : (
                <div className={styles.ordersGrid}>
                    {orders.map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h3>#{order.trackingId}</h3>
                                    <p className={styles.date}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.section}>
                                    <h4>Customer</h4>
                                    <p>{order.user.name || "N/A"}</p>
                                    <p className={styles.detail}>{order.user.email}</p>
                                </div>

                                <div className={styles.section}>
                                    <h4>Sender</h4>
                                    <p>{order.senderName}</p>
                                    <p className={styles.detail}>{order.senderPhone}</p>
                                </div>

                                <div className={styles.section}>
                                    <h4>Receiver</h4>
                                    <p>{order.receiverName}</p>
                                    <p className={styles.detail}>{order.receiverPhone}</p>
                                </div>

                                <div className={styles.section}>
                                    <h4>Addresses</h4>
                                    <p><strong>From:</strong> {order.pickupAddress}</p>
                                    <p><strong>To:</strong> {order.deliveryAddress}</p>
                                </div>

                                <div className={styles.section}>
                                    <h4>Weight</h4>
                                    <p>{order.weight} kg</p>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <label>Update Status:</label>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value as DeliveryStatus)}
                                    disabled={updatingOrderId === order.id}
                                    className={styles.statusSelect}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_TRANSIT">In Transit</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                {updatingOrderId === order.id && (
                                    <span className={styles.updating}>Updating...</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}