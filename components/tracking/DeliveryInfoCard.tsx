import { formatDate, getStatusColor } from "@/lib/tracking-utils";

type DeliveryResult = {
    trackingId: string;
    status: string;
    packageDescription: string | null;
    statusReason: string | null;
    senderName: string;
    receiverName: string;
    weight: number;
    createdAt: string;
    estimatedArrival: string | null;
};

interface DeliveryInfoCardProps {
    delivery: DeliveryResult;
}

export const DeliveryInfoCard = ({ delivery }: DeliveryInfoCardProps) => (
    <div className="result-box">
        <h3>✅ Delivery Found</h3>
        <div className="info-grid">
            <div className="info-item">
                <span className="label">Tracking ID:</span>
                <span className="value">{delivery.trackingId}</span>
            </div>
            <div className="info-item">
                <span className="label">Status:</span>
                <span className={`status-badge ${getStatusColor(delivery.status)}`}>
                    {delivery.status.replace(/_/g, ' ')}
                </span>
            </div>
            {delivery.packageDescription && (
                <div className="info-item">
                    <span className="label">Package:</span>
                    <span className="value">{delivery.packageDescription}</span>
                </div>
            )}
            {delivery.statusReason && (
                <div className="info-item full-width">
                    <span className="label">Status Reason:</span>
                    <span className="value highlight">{delivery.statusReason}</span>
                </div>
            )}
            <div className="info-item">
                <span className="label">Sender:</span>
                <span className="value">{delivery.senderName}</span>
            </div>
            <div className="info-item">
                <span className="label">Receiver:</span>
                <span className="value">{delivery.receiverName}</span>
            </div>
            <div className="info-item">
                <span className="label">Weight:</span>
                <span className="value">{delivery.weight} kg</span>
            </div>
            <div className="info-item">
                <span className="label">Created:</span>
                <span className="value">{formatDate(delivery.createdAt)}</span>
            </div>
            {delivery.estimatedArrival && (
                <div className="info-item">
                    <span className="label">Expected by:</span>
                    <span className="value highlight">{formatDate(delivery.estimatedArrival)}</span>
                </div>
            )}
        </div>
    </div>
);