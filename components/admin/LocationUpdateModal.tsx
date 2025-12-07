"use client";

import styles from "@/styles/OrdersList.module.scss";

type DeliveryStatus =
    | "PENDING"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "CUSTOMS_CLEARANCE"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

interface Order {
    senderName: string;
    senderPhone: string;
    pickupAddress: string;
    receiverName: string;
    receiverPhone: string;
    deliveryAddress: string;
    weight: number;
    originCountry: string;
    destinationCountry: string;
    estimatedArrival?: Date | null;
    status: DeliveryStatus;
    currentLocation?: string | null;
    currentLatitude?: number | null;
    currentLongitude?: number | null;
    packageDescription?: string | null;
}

interface TrackingEntry {
    id: string;
    status: DeliveryStatus;
    location: string;
    timestamp: Date;
    description?: string | null;
}

interface OrderDetailsModalProps {
    order: Order;
    trackingHistory?: TrackingEntry[];
}

export default function OrderDetailsModal({ order, trackingHistory }: OrderDetailsModalProps) {
    return (
        <div className={styles.orderDetails}>
            <div className={styles.detailsGrid}>
                <div className={styles.detailSection}>
                    <h3>Sender Information</h3>
                    <p><strong>Name:</strong> {order.senderName}</p>
                    <p><strong>Phone:</strong> {order.senderPhone}</p>
                    <p><strong>Address:</strong> {order.pickupAddress}</p>
                </div>

                <div className={styles.detailSection}>
                    <h3>Receiver Information</h3>
                    <p><strong>Name:</strong> {order.receiverName}</p>
                    <p><strong>Phone:</strong> {order.receiverPhone}</p>
                    <p><strong>Address:</strong> {order.deliveryAddress}</p>
                </div>

                <div className={styles.detailSection}>
                    <h3>Shipment Details</h3>
                    <p><strong>Weight:</strong> {order.weight} kg</p>
                    <p><strong>Origin:</strong> {order.originCountry}</p>
                    <p><strong>Destination:</strong> {order.destinationCountry}</p>
                    {order.estimatedArrival && (
                        <p><strong>Est. Arrival:</strong> {new Date(order.estimatedArrival).toLocaleString()}</p>
                    )}
                    {order.packageDescription && (
                        <p><strong>Description:</strong> {order.packageDescription}</p>
                    )}
                </div>

                <div className={styles.detailSection}>
                    <h3>Current Status</h3>
                    <p><strong>Status:</strong> {order.status.replace(/_/g, " ")}</p>
                    {order.currentLocation && (
                        <p><strong>Location:</strong> {order.currentLocation}</p>
                    )}
                    {order.currentLatitude && order.currentLongitude && (
                        <p><strong>Coordinates:</strong> {order.currentLatitude.toFixed(4)}, {order.currentLongitude.toFixed(4)}</p>
                    )}
                </div>
            </div>

            {trackingHistory && trackingHistory.length > 0 && (
                <div className={styles.trackingHistory}>
                    <h3>Tracking History</h3>
                    <div className={styles.historyList}>
                        {trackingHistory.map((entry) => (
                            <div key={entry.id} className={styles.historyItem}>
                                <div className={styles.historyDot}></div>
                                <div className={styles.historyContent}>
                                    <p className={styles.historyStatus}>{entry.status.replace(/_/g, " ")}</p>
                                    <p className={styles.historyLocation}>{entry.location}</p>
                                    {entry.description && (
                                        <p className={styles.historyDesc}>{entry.description}</p>
                                    )}
                                    <p className={styles.historyTime}>
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}