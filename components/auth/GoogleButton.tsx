"use client"

import { signIn } from "next-auth/react"
import { FaGoogle } from "react-icons/fa" 
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"

import "@/styles/auth/GoogleAuth.scss"

export const GoogleAuthButton = () => {
    const onClick = (provider: "google") => {
        signIn(provider, {
            callbackUrl: DEFAULT_LOGIN_REDIRECT
        })
    }

    return (
        <button onClick={() => onClick("google")}>
            <FaGoogle />
            Continue with Google
        </button>
    )
}