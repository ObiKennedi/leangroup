"use client"
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Image from "next/image";

import "@/styles/landing-page/Vision.scss"

export const Vision = () => {

    useEffect(() => {
        AOS.init({
            duration: 900,
            easing: "ease-in-out",
            once: true,
        });
    }, []);

    return (
        <section className="vision">
            <div className="vision-image" data-aos="fade-up">
                <Image
                    src="/hero image.png"
                    width={500}
                    height={500}
                    alt="hero"
                />
            </div>

            <div className="vision-text" data-aos="fade-up">
                <h2>Our Vision</h2>

                <div className="vision-paragraphs">
                    <p>
                        Our vision is to redefine global delivery by building a logistics ecosystem where distance is no longer a barrier. We aim to create a world where sending anything—documents, gifts, products, or essentials—is as simple, fast, and secure as sending a message. Through innovation, technology, and seamless international networks, we envision a future where individuals and businesses can connect effortlessly across borders.
                    </p>

                    <p>
                        We aspire to become the most trusted name in worldwide logistics, known for reliability, transparency, and human-centered service. By constantly improving our systems, strengthening our partnerships, and listening to the needs of our customers, we are committed to shaping a delivery experience that inspires confidence, speeds up global trade, and supports the dreams of people everywhere.
                    </p>
                </div>
            </div>
        </section>
    );
};