"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import {
    FaBolt,
    FaGlobeAmericas,
    FaShieldAlt,
    FaMapMarkedAlt,
    FaTruckLoading
} from "react-icons/fa";
import { MdSupportAgent, MdPayments } from "react-icons/md";
import { RiPriceTag3Fill } from "react-icons/ri";

import "@/styles/landing-page/ValueProps.scss";

const ValuePropsItems = [
    {
        id: 1,
        title: "Speedy Delivery",
        description: "Fast and reliable delivery to any destination worldwide.",
        icon: <FaBolt />
    },
    {
        id: 2,
        title: "Worldwide Reach",
        description: "Send packages across countries with seamless international logistics.",
        icon: <FaGlobeAmericas />
    },
    {
        id: 3,
        title: "Secure Handling",
        description: "Every package is handled with strict safety and care standards.",
        icon: <FaShieldAlt />
    },
    {
        id: 4,
        title: "Real-Time Tracking",
        description: "Track your shipment live from pickup to drop-off.",
        icon: <FaMapMarkedAlt />
    },
    {
        id: 5,
        title: "Affordable Pricing",
        description: "Transparent rates with no hidden charges.",
        icon: <RiPriceTag3Fill />
    },
    {
        id: 6,
        title: "Exceptional Support",
        description: "24/7 dedicated customer support for any questions.",
        icon: <MdSupportAgent />
    },
    {
        id: 7,
        title: "Professional Handling",
        description: "Packages managed by trained logistics experts.",
        icon: <FaTruckLoading />
    },
    {
        id: 8,
        title: "Easy Payments",
        description: "Multiple secure payment methods for convenience.",
        icon: <MdPayments />
    }
];

export const ValueProps = () => {

    useEffect(() => {
        AOS.init({
            duration: 1200,
            once: true
        });
    }, []);

    return (
        <section className="value-props">
            {ValuePropsItems.map((e, i) => (
                <div
                    key={e.id}
                    className="value-card"
                    data-aos="fade-up"
                    data-aos-delay={i * 100}
                >
                    <span className="icon">{e.icon}</span>
                    <h2>{e.title}</h2>
                    <p>{e.description}</p>
                </div>
            ))}
        </section>
    );
};
