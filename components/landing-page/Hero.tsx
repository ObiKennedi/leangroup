"use client";

import { useEffect } from "react";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";

import { RedirectButton } from "../RedirectButton";
import "@/styles/landing-page/Hero.scss";

export const HeroSection = () => {
    useEffect(() => {
        AOS.init({
            duration: 1200,
            once: true
        });
    }, []);

    return (
        <section className="hero">
            <Image
                src={"/background.png"}
                width={1000}
                height={1000}
                alt="background"
            />

            <div className="hero-content">
                <div className="hero-header" data-aos="fade-down">
                    <Image
                        src={"/logo.png"}
                        width={200}
                        height={200}
                        alt="logo"
                    />
                    <p data-aos="fade-up">
                        Send anything to anyone, anywhere in the world.
                    </p>
                </div>

                <div className="hero-buttons" data-aos="zoom-in">
                    <RedirectButton destination="/services">Learn More</RedirectButton>
                    <RedirectButton destination="/register">Get Started</RedirectButton>
                </div>
            </div>
        </section>
    );
};