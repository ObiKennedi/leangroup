import {
    LayoutDashboard,
    MessageCircle,
    User
} from "lucide-react"

import "@/styles/BottomNav.scss"

const bottomNavLinks = [
    {
        id: 1,
        name: "Dashboard",
        icon: <LayoutDashboard/>,
        href: "/admin/dashboard"
    },
    {
        id: 2,
        name: "Profile",
        icon: <User/>,
        href: "/admin-profile"
    }
]

export const AdminBottomNav = () =>{
    return(
        <nav className="bottom-nav">
            <ul>
                {bottomNavLinks.map((item)=>(
                    <li key={item.id}>
                        <a href={item.href}>
                            {item.icon}
                            <p>{item.name}</p>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}