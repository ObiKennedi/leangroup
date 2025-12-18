import { ContactForm } from "@/components/landing-page/ContactForm"
import { Phone } from "lucide-react";
import { MdEmail } from "react-icons/md";
import "@/styles/Support.scss";

const Support = () => {
    return (
        <main className="support-page">
            <ContactForm />

            <div className="contact-info-section">
                <div className="contact-card">
                    <p className="contact-header">
                        <span>Phone</span>
                        <Phone />
                    </p>
                    <p className="contact-value">
                        <a href="tel:+15104551667">+1 510 455 1667</a>
                    </p>
                </div>

                <div className="contact-card">
                    <p className="contact-header">
                        <span>Email</span>
                        <MdEmail />
                    </p>
                    <p className="contact-value">
                        <a href="mailto:support@leangrouplogistics.site">
                            support@leangrouplogistics.site
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Support;