import { BottomNav } from "@/components/BottomNav"
import "@/styles/Settings.scss"
import { Providers } from "@/components/Providers"

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Providers>
                {children}
            </Providers>
            <BottomNav />
        </>
    )
}

export default ProtectedLayout