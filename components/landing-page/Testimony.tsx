'use client';

import Image from "next/image";
import styles from "@/styles/landing-page/Testimonials.module.scss";

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'

const StarRating = ({ rating }: { rating: number }) => {
    const totalStars = 5;
    const stars = [];
    for (let i = 1; i <= totalStars; i++) {
        stars.push(
            <span
                key={i}
                className={i <= rating ? styles.starFilled : styles.starEmpty}
            >
                ★
            </span>
        );
    }
    return <div className={styles.starRating}>{stars}</div>;
};

const TestimonialItems = [
    {
        id: 1,
        name: "Daniel Chen",
        role: "Small Business Owner",
        message:
            "Using this service completely transformed how I send products to my customers. Deliveries are faster, tracking is accurate, and I’ve never had a single lost package.",
        rating: 5,
        avatar: "/avatars/Daniel.png"
    },
    {
        id: 2,
        name: "Ahmed Al-Sayed",
        role: "Frequent International Sender",
        message:
            "I love how easy it is to ship items abroad. The support team is always available, and the process is smooth from pickup to delivery.",
        rating: 4,
        avatar: "/avatars/Ahmed.png"
    },
    {
        id: 3,
        name: "Michael Thompson",
        role: "E-commerce Store Owner",
        message:
            "Finally, a delivery service that understands reliability. My customers always get their packages on time, and it has boosted my store’s reputation.",
        rating: 5,
        avatar: "/avatars/Michael.png"
    },
    {
        id: 4,
        name: "Sarah Williams",
        role: "Student",
        message:
            "I use this service to send documents and personal items to family. It’s affordable, secure, and their real-time tracking gives me peace of mind.",
        rating: 4,
        avatar: "/avatars/Sarah.png"
    },
    {
        id: 5,
        name: "Miguel Martinez",
        role: "Fashion Designer",
        message:
            "My clothing deliveries used to be a nightmare until I switched to them. Their handling is professional and my items always arrive in perfect condition.",
        rating: 5,
        avatar: "/avatars/Miguel.png"
    }
];

export const Testimonials = () => {

    useEffect(() => {
        AOS.init({
            once: true, 
            offset: 50, 
            duration: 800, 
        });
    }, []);

    return (
        <section className={styles.testimonialsSection} data-aos="fade-up">
            <h2 className={styles.heading}>
                What our customers have to say
            </h2>
            <div className={styles.testimonialsGrid}>
                {TestimonialItems.map((item, index) => (
                    <div
                        key={item.id}
                        className={styles.card}
                        data-aos="zoom-in-up"
                        data-aos-delay={index * 100}
                        data-aos-duration="600"
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.avatarContainer}>
                                <Image
                                    src={item.avatar}
                                    width={70}
                                    height={70}
                                    alt={`Avatar of ${item.name}`}
                                    className={styles.avatar}
                                />
                            </div>
                            <div className={styles.userInfo}>
                                <h3 className={styles.name}>{item.name}</h3>
                                <p className={styles.role}>{item.role}</p>
                            </div>
                        </div>

                        <p className={styles.message}>{item.message}</p>

                        <div className={styles.ratingContainer}>
                            <StarRating rating={item.rating} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};