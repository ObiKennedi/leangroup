import { CheckCircle } from "lucide-react"
import "@/styles/auth/FormMessage.scss"

interface FormSuccessProps {
    message?: string;
}

export const FormSuccess = ({message}: FormSuccessProps) =>{
   if (!message) return null

   return(
        <div className="form-message success">
            <CheckCircle/>
            <p>{message}</p>
        </div>
   )
}