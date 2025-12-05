"use client"
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import {
    FaCalendarCheck,
    FaBiking,
    FaLocationArrow,
    FaCheckCircle
} from "react-icons/fa";

import "@/styles/landing-page/HowItWorks.scss"

const HowItWorksItems = [
    {
        id: 1,
        title: "Schedule Your Pickup",
        description: "Enter your package details, set your pickup location, and choose a convenient time.",
        icon: <FaCalendarCheck />
    },
    {
        id: 2,
        title: "We Pick It Up",
        description: "Our rider arrives on time to collect your package with proper verification and care.",
        icon: <FaBiking />
    },
    {
        id: 3,
        title: "Track in Real Time",
        description: "Monitor your delivery status live from dispatch to final destination.",
        icon: <FaLocationArrow />
    },
    {
        id: 4,
        title: "Fast & Safe Delivery",
        description: "Your package is delivered promptly and securely, with confirmation provided instantly.",
        icon: <FaCheckCircle />
    }
];

export const HowItWorks = () => {

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: "ease-in-out",
            once: true,
        });
    }, []);

    return (
        <section className="how-it-works">
            <h1 data-aos="fade-up">How it works</h1>

            <div className="how-items">
                {HowItWorksItems.map((item, i) => (
                    <div
                        key={item.id}
                        className="how-card"
                        data-aos="fade-up"
                        data-aos-delay={i * 150}
                    >
                        <div className="icon">{item.icon}</div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
