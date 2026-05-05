import { OTPForm } from "@/components/auth/OTPForm"
import { Suspense } from "react"

const OTPPage = () => {
  return (
    <Suspense>
      <OTPForm />
    </Suspense>
  )
}

export default OTPPage