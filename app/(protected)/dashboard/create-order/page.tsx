import CreateOrderForm from "@/components/CreatedOrders"
import "@/styles/Userdashboard.scss"
import { Suspense } from "react"

const CreateOrderPage = () =>{
    return(
        <main>
            <Suspense fallback={<div>Loading form and user data...</div>}>
                <CreateOrderForm/>
            </Suspense>
        </main>
    )
}

export default CreateOrderPage