"use client";

import React, { useState } from 'react';
import { Package, MapPin, Calendar, Weight, Plane, Phone, User, Copy, Check, FileText, Clock } from 'lucide-react';
import "@/styles/OrderReciept.scss";

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
        name: string;
        phone: string;
        address: string;
    };
    receiver: {
        name: string;
        phone: string;
        address: string;
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

interface OrderReceiptProps {
    receipt: Receipt;
    onClose: () => void;
    onPrint: () => void;
}

export default function OrderReceipt({ receipt, onClose, onPrint }: OrderReceiptProps) {
    const [copied, setCopied] = useState(false);

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRouteLocationDisplay = (route: RoutePoint) => {
        const parts = [];
        if (route.cityName) parts.push(route.cityName);
        parts.push(route.countryName);
        return parts.join(", ");
    };

    const handleCopyReceipt = () => {
        const receiptText = `
ORDER RECEIPT
═══════════════════════════════════════

Tracking ID: ${receipt.trackingId}
Order Date: ${formatDate(receipt.orderDate)}

SENDER INFORMATION
─────────────────────────────────────
Name: ${receipt.sender.name}
Phone: ${receipt.sender.phone}
Address: ${receipt.sender.address}

RECEIVER INFORMATION
─────────────────────────────────────
Name: ${receipt.receiver.name}
Phone: ${receipt.receiver.phone}
Address: ${receipt.receiver.address}

SHIPMENT DETAILS
─────────────────────────────────────
Weight: ${receipt.shipment.weight} kg
${receipt.shipment.packageDescription ? `Description: ${receipt.shipment.packageDescription}` : ''}
Route: ${receipt.shipment.originCountry} → ${receipt.shipment.destinationCountry}
${receipt.shipment.estimatedArrival ? `Est. Arrival: ${formatDate(receipt.shipment.estimatedArrival)}` : ''}
Status: ${receipt.shipment.status.replace(/_/g, ' ')}
${receipt.shipment.statusReason ? `Status Reason: ${receipt.shipment.statusReason}` : ''}

${receipt.routes.length > 0 ? `ROUTE CHECKPOINTS (${receipt.routes.length})
─────────────────────────────────────
${receipt.routes.map((route, index) => `${index + 1}. ${getRouteLocationDisplay(route)}
   Country Code: ${route.countryCode}
   Coordinates: ${route.latitude.toFixed(4)}, ${route.longitude.toFixed(4)}${route.estimatedArrivalTime ? `
   ETA: ${formatDate(route.estimatedArrivalTime)}` : ''}`).join('\n\n')}` : ''}

═══════════════════════════════════════
Please keep this receipt for your records.
        `.trim();

        navigator.clipboard.writeText(receiptText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="receipt-overlay">
            <div className="receipt-modal">
                {/* Header */}
                <div className="receipt-header">
                    <div className="header-content">
                        <div className="header-title">
                            <Package className="icon" />
                            <h2>Order Receipt</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="close-btn"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="receipt-body">
                    {/* Tracking Info */}
                    <div className="tracking-section">
                        <div className="tracking-content">
                            <p className="tracking-label">Tracking ID</p>
                            <p className="tracking-id">{receipt.trackingId}</p>
                            <p className="tracking-date">Order Date: {formatDate(receipt.orderDate)}</p>
                        </div>
                    </div>

                    {/* Sender & Receiver Info */}
                    <div className="parties-grid">
                        {/* Sender */}
                        <div className="party-card">
                            <div className="party-header">
                                <User className="icon" />
                                <h3>Sender</h3>
                            </div>
                            <div className="party-details">
                                <p className="party-name">{receipt.sender.name}</p>
                                <div className="party-info">
                                    <Phone className="info-icon" />
                                    <p>{receipt.sender.phone}</p>
                                </div>
                                <div className="party-info">
                                    <MapPin className="info-icon" />
                                    <p>{receipt.sender.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Receiver */}
                        <div className="party-card">
                            <div className="party-header">
                                <User className="icon" />
                                <h3>Receiver</h3>
                            </div>
                            <div className="party-details">
                                <p className="party-name">{receipt.receiver.name}</p>
                                <div className="party-info">
                                    <Phone className="info-icon" />
                                    <p>{receipt.receiver.phone}</p>
                                </div>
                                <div className="party-info">
                                    <MapPin className="info-icon" />
                                    <p>{receipt.receiver.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipment Details */}
                    <div className="shipment-section">
                        <h3 className="section-title">
                            <Package className="icon" />
                            Shipment Details
                        </h3>
                        <div className="shipment-grid">
                            <div className="shipment-item">
                                <Weight className="icon" />
                                <div>
                                    <p className="item-label">Weight</p>
                                    <p className="item-value">{receipt.shipment.weight} kg</p>
                                </div>
                            </div>
                            <div className="shipment-item">
                                <Plane className="icon" />
                                <div>
                                    <p className="item-label">Route</p>
                                    <p className="item-value">
                                        {receipt.shipment.originCountry} → {receipt.shipment.destinationCountry}
                                    </p>
                                </div>
                            </div>
                            {receipt.shipment.estimatedArrival && (
                                <div className="shipment-item">
                                    <Calendar className="icon" />
                                    <div>
                                        <p className="item-label">Est. Arrival</p>
                                        <p className="item-value">{formatDate(receipt.shipment.estimatedArrival)}</p>
                                    </div>
                                </div>
                            )}
                            <div className="shipment-item">
                                <div className="status-indicator">
                                    <div className="status-dot"></div>
                                </div>
                                <div>
                                    <p className="item-label">Status</p>
                                    <p className="item-value">{receipt.shipment.status.toLowerCase().replace(/_/g, ' ')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Package Description */}
                        {receipt.shipment.packageDescription && (
                            <div className="description-section">
                                <div className="description-header">
                                    <FileText className="icon" />
                                    <h4>Package Description</h4>
                                </div>
                                <p className="description-text">{receipt.shipment.packageDescription}</p>
                            </div>
                        )}

                        {/* Status Reason */}
                        {receipt.shipment.statusReason && (
                            <div className="status-reason-section">
                                <div className="status-reason-header">
                                    <div className="status-indicator">
                                        <div className="status-dot"></div>
                                    </div>
                                    <h4>Status Reason</h4>
                                </div>
                                <p className="status-reason-text">{receipt.shipment.statusReason}</p>
                            </div>
                        )}
                    </div>

                    {/* Route Checkpoints */}
                    {receipt.routes && receipt.routes.length > 0 && (
                        <div className="routes-section">
                            <h3 className="section-title">
                                <MapPin className="icon" />
                                Route Checkpoints ({receipt.routes.length})
                            </h3>
                            <div className="routes-list">
                                {receipt.routes.map((route, index) => (
                                    <div key={index} className="route-item">
                                        <div className="route-number">{index + 1}</div>
                                        <div className="route-info">
                                            <p className="route-location">{getRouteLocationDisplay(route)}</p>
                                            <p className="route-country-code">{route.countryCode}</p>
                                            <p className="route-coords">
                                                {route.latitude.toFixed(4)}, {route.longitude.toFixed(4)}
                                            </p>
                                            {route.estimatedArrivalTime && (
                                                <div className="route-eta">
                                                    <Clock className="eta-icon" />
                                                    <span>ETA: {formatDate(route.estimatedArrivalTime)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Note */}
                    <div className="footer-note">
                        <p>
                            Please keep this receipt for your records. Use the tracking ID to monitor your shipment.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button onClick={handleCopyReceipt} className="copy-btn">
                            {copied ? <Check className="btn-icon" /> : <Copy className="btn-icon" />}
                            {copied ? 'Copied!' : 'Copy Receipt'}
                        </button>
                        <button onClick={onPrint} className="print-btn">
                            Print Receipt
                        </button>
                        <button onClick={onClose} className="close-action-btn">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}