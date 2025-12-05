"use client"

import * as z from "zod"
import { CardWrapper } from "./CardWrapper"

import { useForm } from "react-hook-form"
import { useState, useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/schema"

import { RedirectButton } from "../RedirectButton"
import { FormError } from "./FormError"
import { FormSuccess } from "./FormSuccess"

import { login } from "@/actions/login"

import { Eye, EyeOff } from "lucide-react"
import "@/styles/auth/AuthForm.scss"

export const LoginForm = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const urlError = searchParams.get("error") ===
        "OAuthAccountNotLinked" ? "Wrong provider, continue google" : ""

    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("")
        setSuccess("")

        startTransition(() => {
            login(values)
                .then(async (data) => {
                    if (data?.error) {
                        setError(data.error)
                        return
                    }

                    if (data?.success) {
                        setSuccess(data.success)

                        // Fetch the session to check user role
                        const session = await fetch("/api/auth/session").then(r => r.json())

                        if (session?.user?.role === "ADMIN") {
                            router.push("/admin/dashboard")
                        } else {
                            router.push("/dashboard") // or your default user page
                        }
                    }
                })
        })
    }

    return (
        <CardWrapper
            headerLabel="Sign In"
            headerWriteUp="Sign into your account and continue with us."
            showSocial
            showBackLink
            backLinkHref="/register"
            backLinkLabel="Sign Up"
            backLinkWriteUp="Don't have an account?"
        >
            <form onSubmit={form.handleSubmit(onSubmit)} className="form">
                <div className="form-container">
                    <div className="input-container">
                        <label htmlFor="email">Email Address</label>
                        <input
                            disabled={isPending}
                            id="email"
                            placeholder="example@mail.com"
                            type="email"
                            {...form.register("email")}
                        />
                        <div className="error-message">{form.formState.errors.email?.message}</div>
                    </div>
                    <div className="input-container password-container">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                disabled={isPending}
                                id="password"
                                placeholder="******"
                                type={showPassword ? "text" : "password"}
                                {...form.register("password")}
                            />
                            <span
                                className="toggle-eye"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} strokeWidth={2} />
                                ) : (
                                    <Eye size={20} strokeWidth={2} />
                                )}
                            </span>
                        </div>
                        <div className="error-message">{form.formState.errors.password?.message}</div>
                    </div>
                    <RedirectButton destination="/reset-password">Forgot Password ?</RedirectButton>
                </div>
                <FormError message={error || urlError} />
                <FormSuccess message={success} />
                <button
                    className={isPending ? "pending" : ""}
                    disabled={isPending}
                >{isPending ? "Please wait ..." : "Login"}</button>
            </form>
        </CardWrapper>
    )
}