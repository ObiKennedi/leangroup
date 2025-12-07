"use client";

import { MapPin, Package, Navigation, Map } from "lucide-react";
import styles from "@/styles/OrdersList.module.scss";

type DeliveryStatus =
    | "PENDING"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "CUSTOMS_CLEARANCE"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

type Order = {
    id: string;
    trackingId: string;
    weight: number;
    status: DeliveryStatus;
    createdAt: Date;
    originCountry: string;
    destinationCountry: string;
    currentLocation?: string | null;
    receiverName: string;
    receiverPhone: string;
    user: {
        name: string | null;
        email: string | null;
    };
    routes: any[];
};

interface OrderCardProps {
    order: Order;
    updatingOrderId: string | null;
    onStatusUpdate: (orderId: string, status: DeliveryStatus) => void;
    onOpenModal: (order: Order, type: 'location' | 'destination' | 'route' | 'details') => void;
}

export default function OrderCard({ order, updatingOrderId, onStatusUpdate, onOpenModal }: OrderCardProps) {
    const getStatusColor = (status: DeliveryStatus) => {
        switch (status) {
            case "PENDING": return styles.statusPending;
            case "PICKED_UP": return styles.statusPickedUp;
            case "IN_TRANSIT": return styles.statusInTransit;
            case "CUSTOMS_CLEARANCE": return styles.statusCustoms;
            case "OUT_FOR_DELIVERY": return styles.statusOutForDelivery;
            case "DELIVERED": return styles.statusDelivered;
            case "CANCELLED": return styles.statusCancelled;
            default: return "";
        }
    };

    return (
        <div className={styles.orderCard}>
            <div className={styles.cardHeader}>
                <div>
                    <h3>#{order.trackingId}</h3>
                    <p className={styles.date}>
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, " ")}
                </span>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.section}>
                    <h4>Customer</h4>
                    <p>{order.user.name || "N/A"}</p>
                    <p className={styles.detail}>{order.user.email}</p>
                </div>

                <div className={styles.section}>
                    <h4>Shipment Route</h4>
                    <p><strong>From:</strong> {order.originCountry}</p>
                    <p><strong>To:</strong> {order.destinationCountry}</p>
                    {order.currentLocation && (
                        <p className={styles.detail}>
                            <MapPin className={styles.icon} />
                            {order.currentLocation}
                        </p>
                    )}
                </div>

                <div className={styles.section}>
                    <h4>Receiver</h4>
                    <p>{order.receiverName}</p>
                    <p className={styles.detail}>{order.receiverPhone}</p>
                </div>

                <div className={styles.section}>
                    <h4>Weight & Routes</h4>
                    <p>{order.weight} kg</p>
                    <p className={styles.detail}>
                        {order.routes.length} checkpoint{order.routes.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <div className={styles.quickActions}>
                <button
                    className={styles.actionBtn}
                    onClick={() => onOpenModal(order, "location")}
                    title="Update Location"
                >
                    <Navigation className={styles.btnIcon} />
                    Location
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => onOpenModal(order, "destination")}
                    title="Update Destination"
                >
                    <MapPin className={styles.btnIcon} />
                    Destination
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => onOpenModal(order, "route")}
                    title="Manage Routes"
                >
                    <Map className={styles.btnIcon} />
                    Routes
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => onOpenModal(order, "details")}
                    title="View Details"
                >
                    <Package className={styles.btnIcon} />
                    Details
                </button>
            </div>

            <div className={styles.cardFooter}>
                <label>Update Status:</label>
                <select
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order.id, e.target.value as DeliveryStatus)}
                    disabled={updatingOrderId === order.id}
                    className={styles.statusSelect}
                >
                    <option value="PENDING">Pending</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="CUSTOMS_CLEARANCE">Customs Clearance</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                {updatingOrderId === order.id && (
                    <span className={styles.updating}>Updating...</span>
                )}
            </div>
        </div>
    );
}