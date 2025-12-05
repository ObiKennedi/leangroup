"use client"

import { useEffect } from "react";

import Image from "next/image";
import { RedirectButton } from "./RedirectButton";

import AOS from "aos";
import "aos/dist/aos.css";

import "@/styles/InfoCards.scss"

interface InfoCardsProps {
    image: string;
    heading: string;
    writeUp: string;
    showButton?: boolean;
    buttonTag?: string;
    buttonRef: string;
}

export const InfoCards = (
    { image, heading, writeUp, showButton, buttonTag, buttonRef }: InfoCardsProps
) => {

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: "ease-in-out",
            once: true,
        });
    }, []);

    return (
        <div className="info-cards" data-aos="fade-up">
            <Image
                src={image}
                width={200}
                height={200}
                alt={heading}
                className="info-card-image"
            />
            <div>
                <h2>{heading}</h2>
                <div>{writeUp}</div>

                {showButton && (
                    <RedirectButton destination={buttonRef}>{buttonTag}</RedirectButton>
                )}
            </div>
        </div>
    )
}