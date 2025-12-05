import * as z from "zod"

export const LoginSchema = z.object({
    email: z.email({
        message: "Insert a valid email"
    }), 
    password: z.string().min(1, {
        message: "Please insert your password"
    })
})

export const RegisterSchema = z.object({
    name: z.string().min(1,{message: "Please tell us your name"}),
    email: z.email({ 
        message: "This can't be your email." 
    }).min(1, { 
        message: "Please insert your email."
    }),
    password: z.string().min(8, {
        message: "Your password needs at least 8 characters"
    }).regex(/[A-Z]/, 
        {message: "Password must contain at least one uppercase letter."}
    ).regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter"
    }).regex(/[0-9]/, {
        message: "Password must contain at least one number"
    }).regex(/[^A-Za-z0-9]/, {
        message: "Password must have at least one special character"
    })
})

export const TrackingIdSchema = z.object({
    trackingId: z.string().min(1, {
        message: "Please input your Tracking Code"
    })
})