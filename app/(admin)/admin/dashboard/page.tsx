import AdminOrders from "@/components/admin/OrdersList"
import "@/styles/Userdashboard.scss"

const AdminDashBoard = () =>{
    return(
        <main className="dashboard-tracker">
           <AdminOrders/> 
        </main>
    )
}

export default AdminDashBoard