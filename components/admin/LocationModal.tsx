"use client";

import { useState } from "react";
import styles from "@/styles/OrdersList.module.scss";

interface LocationForm {
    latitude: string;
    longitude: string;
    location: string;
    countryCode: string;
    description: string;
    checkpointActivity: string;
}

interface LocationUpdateModalProps {
    initialData: LocationForm;
    onSubmit: (data: LocationForm) => void;
}

export default function LocationUpdateModal({ initialData, onSubmit }: LocationUpdateModalProps) {
    const [formData, setFormData] = useState<LocationForm>(initialData);

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <div className={styles.form}>
            <div className={styles.formGroup}>
                <label>Location Name</label>
                <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Lagos Port"
                />
            </div>
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label>Latitude</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="6.5244"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Longitude</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="3.3792"
                    />
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>Country Code (Optional)</label>
                <input
                    type="text"
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    placeholder="NG"
                    maxLength={2}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Checkpoint Activity (Optional)</label>
                <input
                    type="text"
                    value={formData.checkpointActivity}
                    onChange={(e) => setFormData({ ...formData, checkpointActivity: e.target.value })}
                    placeholder="Customs clearance in progress"
                />
            </div>
            <div className={styles.formGroup}>
                <label>Description (Optional)</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional notes"
                    rows={3}
                />
            </div>
            <button className={styles.submitBtn} onClick={handleSubmit}>
                Update Location
            </button>
        </div>
    );
}