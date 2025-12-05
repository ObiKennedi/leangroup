import { LoginForm } from "@/components/auth/LoginForm"
import { Suspense } from "react"

const LoginPage = () =>{
    return (
        <Suspense fallback={<div>Loading login form...</div>}>
            <LoginForm/>
        </Suspense>
    )
}

export default LoginPage