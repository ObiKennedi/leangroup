"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useSession } from "next-auth/react"
import { pusherClient } from "@/lib/pusher-client"

import "@/styles/Chat.scss"

const Chats = () => {
    const { data: session } = useSession()
    const userId = session?.user?.id
    const [messages, setMessages] = useState<Array<{ sender: string; text: string; createdAt?: string }>>([])
    const [input, setInput] = useState("")
    const [isPending, startTransition] = useTransition()
    const bottomRef = useRef<HTMLDivElement>(null)

    // Load existing messages on mount
    useEffect(() => {
        if (!userId) return
        fetch("/api/chat/history")
            .then((r) => r.json())
            .then((data) => setMessages(data))
    }, [userId])

    // Pusher subscription
    useEffect(() => {
        if (!userId || !pusherClient) return

        const channel = pusherClient.subscribe(`chat-${userId}`)
        channel.bind("new-message", (data: any) => {
            setMessages((prev) => [...prev, data])
        })

        return () => {
            pusherClient?.unsubscribe(`chat-${userId}`)
        }
    }, [userId])

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = () => {
        if (!input.trim() || !userId) return
        const text = input.trim()
        setInput("")

        startTransition(async () => {
            await fetch("/api/sendMessage", {
                method: "POST",
                body: JSON.stringify({ message: text }),
                headers: { "Content-Type": "application/json" },
            })
        })
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <main className="chats-page">
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
                                    {msg.createdAt
                                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                        : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            <div className="input-bar">
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isPending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isPending}
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
    )
}

export default Chats