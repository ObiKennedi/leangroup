import { auth } from "@/auth";
import { getUserOrdersAction } from "@/actions/getUserOrder";

import "@/styles/UserOrders.scss"

export default async function UserOrders() {
    const session = await auth();
    
    const userId = session?.user?.id;
    const email = session?.user?.email;

    if (!userId || !email) {
        return (
            <div className="user-order">
                <h1>Your Orders</h1>
                <p>You must be logged in to view your orders.</p>
            </div>
        );
    }

    // Fetch user orders from DB
    const orders = await getUserOrdersAction(userId, email);

    return (
        <div className="user-order">
            <h1>Your Orders</h1>

            {!orders || orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                <div>
                    {orders.map(order => (
                        <div key={order.id}>
                            <div>
                                <span>Tracking ID:</span>
                                <span>{order.trackingId}</span>
                            </div>

                            <div>
                                <span>Status:</span>
                                <span>{order.status}</span>
                            </div>

                            <div>
                                <p><strong>Sender:</strong> {order.senderName} ({order.senderPhone})</p>
                                <p><strong>Receiver:</strong> {order.receiverName} ({order.receiverPhone})</p>
                                <p><strong>From:</strong> {order.pickupAddress}</p>
                                <p><strong>To:</strong> {order.deliveryAddress}</p>
                                <p><strong>Weight:</strong> {order.weight} kg</p>
                                {order.arrivalDate && (
                                    <p className="arrival-date-detail">
                                        <strong>Arrival Date:</strong>{" "}
                                        {new Date(order.arrivalDate).toDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
