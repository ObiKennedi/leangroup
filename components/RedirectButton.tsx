"use client"

import { useRouter } from "next/navigation";

interface RedirectButtonProps {
    children: React.ReactNode;
    destination: string;
}

export const RedirectButton = ({children, destination}: RedirectButtonProps) => {

    const router = useRouter();
    const onClick = () => {
        router.push(destination)
    }

    return (
        <button onClick={onClick}>{children}</button>
    )
}