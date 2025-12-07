"use client";

import { useState } from "react";
import styles from "@/styles/OrdersList.module.scss";

interface DestinationForm {
    destinationCountry: string;
    deliveryAddress: string;
    receiverName: string;
    receiverPhone: string;
    estimatedArrival: string;
}

interface DestinationUpdateModalProps {
    initialData: DestinationForm;
    onSubmit: (data: DestinationForm) => void;
}

export default function DestinationUpdateModal({ initialData, onSubmit }: DestinationUpdateModalProps) {
    const [formData, setFormData] = useState<DestinationForm>(initialData);

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <div className={styles.form}>
            <div className={styles.formGroup}>
                <label>Destination Country</label>
                <input
                    type="text"
                    value={formData.destinationCountry}
                    onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                    placeholder="US"
                />
            </div>
            <div className={styles.formGroup}>
                <label>Delivery Address</label>
                <textarea
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    placeholder="123 Main St, New York, NY"
                    rows={3}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Receiver Name</label>
                <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    placeholder="John Doe"
                />
            </div>
            <div className={styles.formGroup}>
                <label>Receiver Phone</label>
                <input
                    type="text"
                    value={formData.receiverPhone}
                    onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                    placeholder="+1234567890"
                />
            </div>
            <div className={styles.formGroup}>
                <label>Estimated Arrival</label>
                <input
                    type="datetime-local"
                    value={formData.estimatedArrival}
                    onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })}
                />
            </div>
            <button className={styles.submitBtn} onClick={handleSubmit}>
                Update Destination
            </button>
        </div>
    );
}