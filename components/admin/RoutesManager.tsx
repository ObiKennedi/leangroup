"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Clock, Activity } from "lucide-react";
import styles from "@/styles/OrdersList.module.scss";

interface RoutePoint {
    id: string;
    countryCode: string;
    countryName: string;
    cityName?: string | null;
    latitude: number;
    longitude: number;
    sequence: number;
    isPassed: boolean;
    passedAt?: Date | null;
    estimatedArrivalTime?: Date | null;
    actualArrivalTime?: Date | null;
    checkpointActivity?: string | null;
}

interface RouteForm {
    countryCode: string;
    countryName: string;
    cityName: string;
    latitude: string;
    longitude: string;
    estimatedArrivalTime: string;
    checkpointActivity: string;
}

interface RouteManagerModalProps {
    routes: RoutePoint[];
    onAddRoute: (data: RouteForm) => void;
    onUpdateRoute: (routeId: string, data: RouteForm) => void;
    onDeleteRoute: (routeId: string) => void;
    onTogglePassed: (routeId: string, isPassed: boolean) => void;
}

export default function RouteManagerModal({
    routes,
    onAddRoute,
    onUpdateRoute,
    onDeleteRoute,
    onTogglePassed
}: RouteManagerModalProps) {
    const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
    const [routeForm, setRouteForm] = useState<RouteForm>({
        countryCode: "",
        countryName: "",
        cityName: "",
        latitude: "",
        longitude: "",
        estimatedArrivalTime: "",
        checkpointActivity: "",
    });

    const getRouteLocationDisplay = (route: RoutePoint) => {
        const parts = [];
        if (route.cityName) parts.push(route.cityName);
        parts.push(route.countryName);
        return parts.join(", ");
    };

    const startEditingRoute = (route: RoutePoint) => {
        setEditingRouteId(route.id);
        setRouteForm({
            countryCode: route.countryCode,
            countryName: route.countryName,
            cityName: route.cityName || "",
            latitude: route.latitude.toString(),
            longitude: route.longitude.toString(),
            estimatedArrivalTime: route.estimatedArrivalTime 
                ? new Date(route.estimatedArrivalTime).toISOString().slice(0, 16)
                : "",
            checkpointActivity: route.checkpointActivity || "",
        });
    };

    const handleSubmit = () => {
        if (editingRouteId) {
            onUpdateRoute(editingRouteId, routeForm);
        } else {
            onAddRoute(routeForm);
        }
        resetForm();
    };

    const resetForm = () => {
        setEditingRouteId(null);
        setRouteForm({
            countryCode: "",
            countryName: "",
            cityName: "",
            latitude: "",
            longitude: "",
            estimatedArrivalTime: "",
            checkpointActivity: "",
        });
    };

    return (
        <div className={styles.routeManager}>
            <div className={styles.existingRoutes}>
                <h3>Current Checkpoints ({routes.length})</h3>
                {routes.length === 0 ? (
                    <p className={styles.emptyRoutes}>No checkpoints added yet</p>
                ) : (
                    <div className={styles.routesList}>
                        {routes.map((route) => (
                            <div key={route.id} className={styles.routeItem}>
                                <div className={styles.routeNumber}>{route.sequence}</div>
                                <div className={styles.routeInfo}>
                                    <strong>{getRouteLocationDisplay(route)}</strong>
                                    <div className={styles.routeCoords}>
                                        {route.countryCode} • {route.latitude.toFixed(4)}, {route.longitude.toFixed(4)}
                                    </div>
                                    {route.estimatedArrivalTime && (
                                        <div className={styles.routeEta}>
                                            <Clock size={14} />
                                            ETA: {new Date(route.estimatedArrivalTime).toLocaleString()}
                                        </div>
                                    )}
                                    {route.checkpointActivity && (
                                        <div className={styles.routeActivity}>
                                            <Activity size={14} />
                                            {route.checkpointActivity}
                                        </div>
                                    )}
                                    {route.isPassed && route.actualArrivalTime && (
                                        <div className={styles.routeActual}>
                                            ✓ Arrived: {new Date(route.actualArrivalTime).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.routeActions}>
                                    <input
                                        type="checkbox"
                                        checked={route.isPassed}
                                        onChange={(e) => onTogglePassed(route.id, e.target.checked)}
                                        title="Mark as passed"
                                    />
                                    <button className={styles.iconBtn} onClick={() => startEditingRoute(route)}>
                                        <Edit size={16} />
                                    </button>
                                    <button className={styles.iconBtn} onClick={() => onDeleteRoute(route.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.addRouteForm}>
                <h3>
                    {editingRouteId ? (
                        <>
                            <Edit size={20} /> Edit Checkpoint
                        </>
                    ) : (
                        <>
                            <Plus size={20} /> Add New Checkpoint
                        </>
                    )}
                </h3>
                <div className={styles.form}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Country Code</label>
                            <input
                                type="text"
                                value={routeForm.countryCode}
                                onChange={(e) => setRouteForm({ ...routeForm, countryCode: e.target.value })}
                                placeholder="US"
                                maxLength={2}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Country Name</label>
                            <input
                                type="text"
                                value={routeForm.countryName}
                                onChange={(e) => setRouteForm({ ...routeForm, countryName: e.target.value })}
                                placeholder="United States"
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>City/Checkpoint (Optional)</label>
                        <input
                            type="text"
                            value={routeForm.cityName}
                            onChange={(e) => setRouteForm({ ...routeForm, cityName: e.target.value })}
                            placeholder="New York"
                        />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={routeForm.latitude}
                                onChange={(e) => setRouteForm({ ...routeForm, latitude: e.target.value })}
                                placeholder="40.7128"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={routeForm.longitude}
                                onChange={(e) => setRouteForm({ ...routeForm, longitude: e.target.value })}
                                placeholder="-74.0060"
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Estimated Arrival Time (Optional)</label>
                        <input
                            type="datetime-local"
                            value={routeForm.estimatedArrivalTime}
                            onChange={(e) => setRouteForm({ ...routeForm, estimatedArrivalTime: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Checkpoint Activity (Optional)</label>
                        <input
                            type="text"
                            value={routeForm.checkpointActivity}
                            onChange={(e) => setRouteForm({ ...routeForm, checkpointActivity: e.target.value })}
                            placeholder="Package being processed"
                        />
                    </div>
                    <div className={styles.formActions}>
                        {editingRouteId ? (
                            <>
                                <button className={styles.submitBtn} onClick={handleSubmit}>
                                    Update Checkpoint
                                </button>
                                <button className={styles.cancelBtn} onClick={resetForm}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button className={styles.submitBtn} onClick={handleSubmit}>
                                Add Checkpoint
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}