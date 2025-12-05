"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MdAccountCircle, MdHeadsetMic, MdBuild, MdMenu, MdClose } from "react-icons/md";
import { useRouter } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

import "@/styles/landing-page/NavBar.scss";
import { RedirectButton } from "../RedirectButton";

const NavLinks = [
    { id: 1, title: "Tracking", href: "/track", icons: <MdAccountCircle /> },
    { id: 2, title: "Support", href: "/support", icons: <MdHeadsetMic /> },
    { id: 3, title: "Services", href: "/services", icons: <MdBuild /> }
];

export const NavBar = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    const router = useRouter();
    const onClick = () => {
        router.push("/")
    }


    return (
        <header data-aos="fade-down" className="nav-bar">
            <div className="logo" onClick={onClick}>
                <Image src="/logo.png" width={200} height={200} alt="logo" />
            </div>

            <div className="menu-icon" onClick={() => setOpen(!open)}>
                {open ? <MdClose /> : <MdMenu />}
            </div>

            <nav className={open ? "open" : ""}>
                <ul>
                    {NavLinks.map((item) => (
                        <li key={item.id}>
                            <a href={item.href}>
                                {item.icons}
                                {item.title}
                            </a>
                        </li>
                    ))}
                </ul>

                <RedirectButton destination="/register">Get Started</RedirectButton>
            </nav>
        </header>
    );
};
