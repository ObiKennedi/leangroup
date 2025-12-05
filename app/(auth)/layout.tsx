import Image from "next/image"
import "./globals.scss"

const AuthLayout = ({ children }: { children: React.ReactNode }) =>{
    return(
        <main>
            <Image 
                src="/hero image.png"
                width={1000}
                height={1000}
                alt="boarmeeting"
            />
            {children}
        </main>
    )
}

export default AuthLayout