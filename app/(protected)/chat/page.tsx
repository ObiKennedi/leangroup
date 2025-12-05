"use client";

import { useState, useEffect } from "react";
import "@/styles/Chat.scss";
import Pusher from "pusher-js";

const Chats = () => {
    const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);
    const [input, setInput] = useState("");
    const [hasReceivedAutoReply, setHasReceivedAutoReply] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        let id = localStorage.getItem("chat-user-id");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("chat-user-id", id);
        }
        setUserId(id);
    }, []);

    // Subscribe to Pusher
    useEffect(() => {
        if (!userId) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusher.subscribe(`chat-${userId}`);

        channel.bind("new-message", (data: any) => {
            setMessages(prev => [...prev, data]);
        });

        return () => {
            pusher.unsubscribe(`chat-${userId}`);
        };
    }, [userId]);

    const handleSend = async () => {
        if (!input.trim() || !userId) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
        setInput("");

        // ↪ Auto reply ONLY for the first message
        if (!hasReceivedAutoReply) {
            setHasReceivedAutoReply(true);

            setTimeout(() => {
                setMessages(prev => [
                    ...prev,
                    {
                        sender: "admin",
                        text: "Thanks for your message! We'll get back to you shortly.",
                    },
                ]);
            }, 1000);
        }

        // Send to backend + add userId
        await fetch("/api/sendMessage", {
            method: "POST",
            body: JSON.stringify({ message: userMessage, userId }),
            headers: { "Content-Type": "application/json" },
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <main className="chats-page">
            {/* HEADER */}
            <div className="chat-header">
                <div className="header-content">
                    <h2>Chat Support</h2>
                    <div className="status-indicator">
                        <span className="dot"></span>
                        <p>Typically replies within minutes</p>
                    </div>
                </div>
                <p className="subtitle">Message the owners for directions & customer support</p>
            </div>

            {/* MESSAGES CONTAINER */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">✉️</div>
                        <p>No messages yet</p>
                        <small>Start the conversation below</small>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`message-wrapper ${msg.sender === "user" ? "user" : "admin"}`}
                        >
                            <div className={`message ${msg.sender === "user" ? "my-message" : "their-message"}`}>
                                <p>{msg.text}</p>
                                <span className="timestamp">
                                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div className="scroll-anchor" />
            </div>

            {/* INPUT BAR */}
            <div className="input-bar">
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={input.trim() ? "active" : ""}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor" />
                        </svg>
                    </button>
                </div>
                <small>Press Enter to send</small>
            </div>
        </main>
    );
};

export default Chats;
