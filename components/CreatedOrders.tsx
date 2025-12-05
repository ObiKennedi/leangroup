"use client";

import { useState } from "react";
import { createOrder } from "@/actions/createOrder";

// 1. IMPORT useSession from your auth library (Assuming NextAuth.js)
import { useSession } from "next-auth/react";

import "@/styles/CreateOrder.scss"

export default function CreateOrderForm() {
    // 2. GET THE SESSION DATA
    const { data: session, status } = useSession(); 

    const [formData, setFormData] = useState({
        senderName: "",
        senderPhone: "",
        receiverName: "",
        receiverPhone: "",
        pickupAddress: "",
        deliveryAddress: "",
        weight: "",
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<null | {
        success: boolean;
        message: string;
        trackingId?: string | null;
    }>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null); // Clear previous result

        // ** Authentication Check **
        const userId = session?.user?.id;
        
        if (status === "loading") {
            // Wait for session status to resolve
            setLoading(false);
            return; 
        }

        if (!userId) {
            setResult({
                success: false,
                message: "Authentication required. Please log in to create an order.",
            });
            setLoading(false);
            return;
        }

        const response = await createOrder(
            {
                senderName: formData.senderName,
                senderPhone: formData.senderPhone,
                receiverName: formData.receiverName,
                receiverPhone: formData.receiverPhone,
                pickupAddress: formData.pickupAddress,
                deliveryAddress: formData.deliveryAddress,
                weight: Number(formData.weight),
            },
            // 3. PASS THE REQUIRED userId AS THE SECOND ARGUMENT
            userId
        );

        setResult(response);
        setLoading(false);
    };

    // If the user is not authenticated, you might want to show a different UI.
    if (status === "loading") {
        return <div className="create-order">Loading authentication status...</div>
    }

    if (status === "unauthenticated") {
        return <div className="create-order">Please log in to create an order.</div>
    }

    return (
        <div className="create-order">
            <h2>Create Order</h2>

            <form className="order-form" onSubmit={handleSubmit}>
                {/* ... all your form fields remain here ... */}
                
                <div className="form-group">
                    <label>Sender Name</label>
                    <input
                        type="text"
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleChange}
                        required
                    />
                </div>
                {/* ... remaining form groups ... */}
                <div className="form-group">
                    <label>Sender Phone</label>
                    <input
                        type="text"
                        name="senderPhone"
                        value={formData.senderPhone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Receiver Name</label>
                    <input
                        type="text"
                        name="receiverName"
                        value={formData.receiverName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Receiver Phone</label>
                    <input
                        type="text"
                        name="receiverPhone"
                        value={formData.receiverPhone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Pickup Address</label>
                    <textarea
                        name="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Delivery Address</label>
                    <textarea
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Weight (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button 
                    className="submit-btn" 
                    type="submit" 
                    disabled={loading || status !== "authenticated"} // Disable if loading or unauthenticated
                >
                    {loading ? "Creating..." : "Create Order"}
                </button>
            </form>

            {result && (
                <div
                    className={`status-message ${result.success ? "success" : "error"
                        }`}
                >
                    <p>{result.message}</p>
                    {result.trackingId && (
                        <p className="tracking">
                            Tracking ID: <strong>{result.trackingId}</strong>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}