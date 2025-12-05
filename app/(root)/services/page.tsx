import { HowItWorks } from "@/components/landing-page/HowItWorks"
import { Services } from "@/components/Services"

import "@/styles/landing-page/track.scss"

const ServicesPage = () => {
    return (
        <main className="service-page">
            <Services />
            <HowItWorks />
        </main>
    )
}

export default ServicesPage