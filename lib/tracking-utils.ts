// lib/tracking-utils.ts
export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

/**
 * Returns the CSS class name for a delivery status
 * @param status - Delivery status enum value
 * @returns CSS class name for styling
 */
export const getStatusColor = (status: string) => {
    switch (status) {
        case "PENDING":
            return "status-pending";
        case "PICKED_UP":
            return "status-picked-up";
        case "IN_TRANSIT":
            return "status-in-transit";
        case "CUSTOMS_CLEARANCE":
            return "status-customs";
        case "OUT_FOR_DELIVERY":
            return "status-out-for-delivery";
        case "DELIVERED":
            return "status-delivered";
        case "CANCELLED":
            return "status-cancelled";
        default:
            return "";
    }
};