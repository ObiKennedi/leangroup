import { BottomNav } from "@/components/BottomNav"
import "@/styles/Settings.scss"

const ProtectedLayout = ({children}: {children: React.ReactNode}) =>{
    return(
        <>
            {children}
            <BottomNav/>
        </>
    )
}

export default ProtectedLayout