import { Navigation } from "lucide-react";
import { TimelineStep } from "./TimelineStep";

type RoutePoint = {
    id: string;
    countryCode: string;
    countryName: string;
    cityName: string | null;
    latitude: number;
    longitude: number;
    sequence: number;
    isPassed: boolean;
    passedAt: string | null;
    estimatedArrivalTime?: string | null;
    distanceFromPrevious?: number | null;
};

type Location = {
    name: string;
    distance?: number | null;
};

type DeliveryResult = {
    status: string;
    currentRouteIndex: number | null;
    routes: RoutePoint[];
    nextLocation: Location;
    routeProgress: {
        totalCheckpoints: number;
        passedCheckpoints: number;
        remainingCheckpoints: number;
        progressPercentage: number;
    };
};

interface VerticalTimelineProps {
    delivery: DeliveryResult;
}

export const VerticalTimeline = ({ delivery }: VerticalTimelineProps) => {
    const currentIndex = delivery.currentRouteIndex ?? 0;

    return (
        <div className="vertical-timeline-container">
            {/* Timeline Header */}
            <div className="timeline-header">
                <Navigation className="header-icon" />
                <h3>Shipment Progress</h3>
                {delivery.status === "IN_TRANSIT" && (
                    <span className="live-badge">
                        <span className="live-dot"></span>
                        LIVE
                    </span>
                )}
            </div>

            {/* Timeline Steps - All checkpoints from origin to destination */}
            <div className="vertical-timeline">
                {delivery.routes.map((route, index) => (
                    <TimelineStep
                        key={route.id}
                        route={route}
                        index={index}
                        currentIndex={currentIndex}
                        totalRoutes={delivery.routes.length}
                        deliveryStatus={delivery.status}
                        nextLocation={delivery.nextLocation}
                    />
                ))}
            </div>

            {/* Progress Summary - Statistics at the bottom */}
            <div className="progress-summary">
                <div className="summary-item">
                    <div className="summary-value">
                        {delivery.routeProgress.passedCheckpoints}
                    </div>
                    <div className="summary-label">Completed</div>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-item">
                    <div className="summary-value">
                        {delivery.routeProgress.remainingCheckpoints}
                    </div>
                    <div className="summary-label">Remaining</div>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-item highlight">
                    <div className="summary-value">
                        {delivery.routeProgress.progressPercentage}%
                    </div>
                    <div className="summary-label">Complete</div>
                </div>
            </div>
        </div>
    );
};