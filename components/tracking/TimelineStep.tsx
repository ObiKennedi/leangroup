import { MapPin, Plane, CheckCircle2, Clock, Navigation } from "lucide-react";
import { formatDate } from "@/lib/tracking-utils";

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

interface TimelineStepProps {
    route: RoutePoint;
    index: number;
    currentIndex: number;
    totalRoutes: number;
    deliveryStatus: string;
    nextLocation: Location;
}

export const TimelineStep = ({ 
    route, 
    index, 
    currentIndex,
    totalRoutes,
    deliveryStatus,
    nextLocation
}: TimelineStepProps) => {
    // CRITICAL: Status determination is ONLY based on index comparison
    // We completely ignore route.isPassed to avoid conflicts
    const isCurrent = index === currentIndex;
    const isPassed = index < currentIndex; // ONLY routes BEFORE current are passed
    const isLast = index === totalRoutes - 1;
    const isNextLocation = index === currentIndex + 1;

    // Debug logging
    console.log(`Route ${index} (${route.cityName || route.countryName}):`, {
        isCurrent,
        isPassed,
        currentIndex,
        routeIsPassed: route.isPassed, // From database (ignored)
    });

    return (
        <div className="timeline-step">
            {/* Left side - Node and connecting line */}
            <div className="timeline-left">
                {/* Checkpoint Node/Icon */}
                <div className={`timeline-node ${isPassed ? 'passed' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                    {isPassed ? (
                        // Routes BEFORE current - green checkmark
                        <CheckCircle2 size={24} />
                    ) : isCurrent ? (
                        // Route AT current index - blue plane with animation
                        <div className="vehicle-icon-node">
                            <Plane size={28} className="plane-icon" />
                            <div className="vehicle-pulse"></div>
                        </div>
                    ) : (
                        // Routes AFTER current - empty circle
                        <div className="node-circle"></div>
                    )}
                </div>

                {/* Vertical connecting line (except for last item) */}
                {!isLast && (
                    <div className={`timeline-line ${isPassed ? 'completed' : 'incomplete'}`}></div>
                )}
            </div>

            {/* Right side - Checkpoint information card */}
            <div className="timeline-right">
                <div className={`timeline-card ${isPassed ? 'passed' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                    
                    {/* Card Header - Location name and status labels */}
                    <div className="card-header">
                        <h4>{route.cityName || route.countryName}</h4>
                        
                        {/* Current Location Label (blue) */}
                        {isCurrent && (
                            <span className="current-label">
                                <Plane size={14} />
                                Current Location
                            </span>
                        )}
                        
                        {/* Next Stop Label (orange) */}
                        {isNextLocation && deliveryStatus === "IN_TRANSIT" && (
                            <span className="next-label">
                                <Navigation size={14} />
                                Next Stop
                            </span>
                        )}
                        
                        {/* Origin Label (green) - only if not current */}
                        {index === 0 && !isCurrent && (
                            <span className="origin-label">Origin</span>
                        )}
                        
                        {/* Destination Label (red) */}
                        {isLast && (
                            <span className="destination-label">Destination</span>
                        )}
                    </div>

                    {/* Card Details - Additional information */}
                    <div className="card-details">
                        
                        {/* Country Information */}
                        <div className="detail-row">
                            <MapPin size={16} />
                            <span>{route.countryName} ({route.countryCode})</span>
                        </div>

                        {/* Timestamp - When package passed through */}
                        {route.passedAt && (
                            <div className="detail-row time-row">
                                <CheckCircle2 size={16} />
                                <span>{formatDate(route.passedAt)}</span>
                            </div>
                        )}

                        {/* Estimated Time of Arrival (for future checkpoints) */}
                        {!route.passedAt && route.estimatedArrivalTime && (
                            <div className="detail-row time-row eta">
                                <Clock size={16} />
                                <span>ETA: {formatDate(route.estimatedArrivalTime)}</span>
                            </div>
                        )}

                        {/* Distance from previous checkpoint */}
                        {route.distanceFromPrevious && index > 0 && (
                            <div className="detail-row distance-row">
                                <Navigation size={16} />
                                <span>{route.distanceFromPrevious.toFixed(0)} km from previous</span>
                            </div>
                        )}

                        {/* Distance to next location (only for current location) */}
                        {isCurrent && deliveryStatus === "IN_TRANSIT" && nextLocation.distance && (
                            <div className="detail-row progress-row">
                                <Plane size={16}/>
                                <span>{nextLocation.distance.toFixed(0)} km to {nextLocation.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};