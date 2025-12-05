"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Package, LocateFixed, ListOrdered } from "lucide-react";

import "@/styles/TopNav.scss"


interface UserData {
    name: string;
    image: string | null;
}

const actionItems = [
    { id: 1, name: "Your Orders", icon: <ListOrdered size={20}/>, href: "/dashboard"},
    { id: 2, name: "Create Order", icon: <Package size={20} />, href: "/dashboard/create-order" },
    { id: 3, name: "Track Order", icon: <LocateFixed size={20} />, href: "/dashboard/track" },
];


export const TopNav = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [greeting, setGreeting] = useState("Hello");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get("/api/user/balance");
                setUserData(res.data);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUserData();

        const hour = new Date().getHours();
        setGreeting(
            hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
        );

    }, []);

    return (
        <header className="top-nav">
            <div className="user-section">
                <div className="profile-img">
                    <Image
                        src={userData?.image || "/default-avatar.png"}
                        alt="Profile"
                        width={45}
                        height={45}
                    />
                </div>
                <div className="user-text">
                    <p className="greeting">{greeting},</p>
                    <h3 className="username">{userData?.name || "User"}</h3>
                </div>
            </div>

            <div className="actions">
                {actionItems.map((item) => (
                    <a key={item.id} href={item.href} className="action-btn">
                        {item.icon}
                        <span>{item.name}</span>
                    </a>
                ))}
            </div>
        </header>
    )
}