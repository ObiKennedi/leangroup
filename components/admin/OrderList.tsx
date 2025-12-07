"use client";

import { useState, useEffect } from "react";
import {
    updateOrderStatus,
    updateCurrentLocation,
    updateDestination,
    addRouteCheckpoint,
    updateRouteCheckpoint,
    deleteRouteCheckpoint
} from "@/actions/UpdateOrderStatus";
import OrderCard from "./OrderCard";
import LocationUpdateModal from "./LocationModal";
import DestinationUpdateModal from "./UpdateDestionation";
import RouteManagerModal from "./RoutesManager";
import OrderDetailsModal from "./LocationUpdateModal";
import styles from "@/styles/OrdersList.module.scss";

type DeliveryStatus =
    | "PENDING"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "CUSTOMS_CLEARANCE"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

type ModalType = "location" | "destination" | "route" | "details" | null;

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<DeliveryStatus | "ALL">("ALL");
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [modalType, setModalType] = useState<ModalType>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filterStatus !== "ALL") {
                params.append("status", filterStatus);
            }

            const response = await fetch(`/api/orders?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.statusText}`);
            }

            const data = await response.json();

            const ordersWithRoutes = (data || []).map((order: any) => ({
                ...order,
                routes: order.routes || [],
                trackingHistory: order.trackingHistory || [],
            }));

            setOrders(ordersWithRoutes);
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
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } else {
            alert(result.error || "Failed to update order status");
        }

        setUpdatingOrderId(null);
    };

    const openModal = (order: any, type: ModalType) => {
        setSelectedOrder(order);
        setModalType(type);
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedOrder(null);
    };

    // Location handlers
    const handleLocationSubmit = async (formData: any) => {
        if (!selectedOrder) return;

        const result = await updateCurrentLocation(selectedOrder.id, {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            location: formData.location,
            countryCode: formData.countryCode || undefined,
            description: formData.description || undefined,
            checkpointActivity: formData.checkpointActivity || undefined,
        });

        if (result.success) {
            fetchOrders();
            closeModal();
            alert("Location updated successfully!");
        } else {
            alert(result.error || "Failed to update location");
        }
    };

    // Destination handlers
    const handleDestinationSubmit = async (formData: any) => {
        if (!selectedOrder) return;

        const result = await updateDestination(selectedOrder.id, {
            destinationCountry: formData.destinationCountry,
            deliveryAddress: formData.deliveryAddress,
            receiverName: formData.receiverName || undefined,
            receiverPhone: formData.receiverPhone || undefined,
            estimatedArrival: formData.estimatedArrival
                ? new Date(formData.estimatedArrival)
                : undefined,
        });

        if (result.success) {
            fetchOrders();
            closeModal();
            alert("Destination updated successfully!");
        } else {
            alert(result.error || "Failed to update destination");
        }
    };

    // Route handlers
    const handleAddRoute = async (formData: any) => {
        if (!selectedOrder) return;

        const result = await addRouteCheckpoint(selectedOrder.id, {
            countryCode: formData.countryCode.toUpperCase(),
            countryName: formData.countryName,
            cityName: formData.cityName || undefined,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            estimatedArrivalTime: formData.estimatedArrivalTime 
                ? new Date(formData.estimatedArrivalTime)
                : undefined,
            checkpointActivity: formData.checkpointActivity || undefined,
        });

        if (result.success) {
            fetchOrders();
            alert("Route checkpoint added successfully!");
        } else {
            alert(result.error || "Failed to add route checkpoint");
        }
    };

    const handleUpdateRoute = async (routeId: string, formData: any) => {
        const result = await updateRouteCheckpoint(routeId, {
            countryCode: formData.countryCode.toUpperCase(),
            countryName: formData.countryName,
            cityName: formData.cityName || undefined,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            estimatedArrivalTime: formData.estimatedArrivalTime 
                ? new Date(formData.estimatedArrivalTime)
                : undefined,
            checkpointActivity: formData.checkpointActivity || undefined,
        });

        if (result.success) {
            fetchOrders();
            alert("Route checkpoint updated successfully!");
        } else {
            alert(result.error || "Failed to update route checkpoint");
        }
    };

    const handleDeleteRoute = async (routeId: string) => {
        if (!confirm("Are you sure you want to delete this checkpoint?")) return;

        const result = await deleteRouteCheckpoint(routeId);

        if (result.success) {
            fetchOrders();
            alert("Route checkpoint deleted successfully!");
        } else {
            alert(result.error || "Failed to delete route checkpoint");
        }
    };

    const handleToggleRoutePassed = async (routeId: string, isPassed: boolean) => {
        const result = await updateRouteCheckpoint(routeId, { isPassed });

        if (result.success) {
            fetchOrders();
        } else {
            alert(result.error || "Failed to update checkpoint status");
        }
    };

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Error Loading Orders</h2>
                    <p>{error}</p>
                    <button onClick={fetchOrders} className={styles.retryButton}>Retry</button>
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
                        <option value="PICKED_UP">Picked Up</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="CUSTOMS_CLEARANCE">Customs Clearance</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
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
                        : `No ${filterStatus.toLowerCase().replace(/_/g, " ")} orders found`}
                </div>
            ) : (
                <div className={styles.ordersGrid}>
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            updatingOrderId={updatingOrderId}
                            onStatusUpdate={handleStatusUpdate}
                            onOpenModal={openModal}
                        />
                    ))}
                </div>
            )}

            {/* Modal Container */}
            {modalType && selectedOrder && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>
                                {modalType === "location" && "Update Current Location"}
                                {modalType === "destination" && "Update Destination"}
                                {modalType === "route" && "Manage Route Checkpoints"}
                                {modalType === "details" && "Order Details"}
                            </h2>
                            <button className={styles.closeBtn} onClick={closeModal}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            {modalType === "location" && (
                                <LocationUpdateModal
                                    initialData={{
                                        latitude: selectedOrder.currentLatitude?.toString() || "",
                                        longitude: selectedOrder.currentLongitude?.toString() || "",
                                        location: selectedOrder.currentLocation || "",
                                        countryCode: "",
                                        description: "",
                                        checkpointActivity: "",
                                    }}
                                    onSubmit={handleLocationSubmit}
                                />
                            )}

                            {modalType === "destination" && (
                                <DestinationUpdateModal
                                    initialData={{
                                        destinationCountry: selectedOrder.destinationCountry,
                                        deliveryAddress: selectedOrder.deliveryAddress,
                                        receiverName: selectedOrder.receiverName,
                                        receiverPhone: selectedOrder.receiverPhone,
                                        estimatedArrival: selectedOrder.estimatedArrival
                                            ? new Date(selectedOrder.estimatedArrival).toISOString().slice(0, 16)
                                            : "",
                                    }}
                                    onSubmit={handleDestinationSubmit}
                                />
                            )}

                            {modalType === "route" && (
                                <RouteManagerModal
                                    routes={selectedOrder.routes}
                                    onAddRoute={handleAddRoute}
                                    onUpdateRoute={handleUpdateRoute}
                                    onDeleteRoute={handleDeleteRoute}
                                    onTogglePassed={handleToggleRoutePassed}
                                />
                            )}

                            {modalType === "details" && (
                                <OrderDetailsModal
                                    order={selectedOrder}
                                    trackingHistory={selectedOrder.trackingHistory}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}