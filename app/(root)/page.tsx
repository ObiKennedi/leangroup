import { ContactForm } from "@/components/landing-page/ContactForm"
import { HeroSection } from "@/components/landing-page/Hero"
import { HowItWorks } from "@/components/landing-page/HowItWorks"
import { Testimonials } from "@/components/landing-page/Testimony"
import { ValueProps } from "@/components/landing-page/ValueProps"
import { Vision } from "@/components/landing-page/Vision"
import { Services } from "@/components/Services"

const HomePage = () =>{
    return(
        <main>
            <HeroSection/>
            <ValueProps/>
            <Services/>
            <HowItWorks/>
            <Vision/>
            <Testimonials/>
            <ContactForm/>
        </main>
    )
}

export default HomePage