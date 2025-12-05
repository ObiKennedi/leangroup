"use client";

import Image from "next/image";
import { FaFacebookF, FaWhatsapp, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import "@/styles/Footer.scss";

const services = [
    "Local Parcel Delivery",
    "International Shipping",
    "E-Commerce Fulfillment",
    "Cargo & Freight"
];

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-logo">
                    <Image src="/logo.png" alt="Logo" width={150} height={150} />
                </div>

                <div className="footer-services">
                    <h3>Our Services</h3>
                    <ul>
                        {services.map((service, i) => (
                            <li key={i}>{service}</li>
                        ))}
                    </ul>
                </div>

                <div className="footer-social">
                    <h3>Follow Us</h3>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                        <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
                        <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
                        <a href="#" aria-label="Instagram"><FaInstagram /></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </div>
        </footer>
    );
};
