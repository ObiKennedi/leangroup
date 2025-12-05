'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import "@/styles/landing-page/ContactForm.scss"
import 'aos/dist/aos.css';

export const ContactForm = () => {

    useEffect(() => {
        AOS.init({
            once: true,
            offset: 50,
            duration: 800,
        });
    }, []);

    return (
        <section className={"contactSection"} data-aos="fade-in" data-aos-duration="1000">
            <h2 className={'heading'} data-aos="fade-up">
                Contact Us
            </h2>

            <form
                action="https://getform.io/f/your-form-endpoint" 
                method="POST"
                className={'form'}
            >
                {/* Group for Name and Email (side-by-side) */}
                <div className={'inputGroup'}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        required
                        className={"input"}
                        data-aos="fade-right"
                        data-aos-delay="100"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                        className={"input"}
                        data-aos="fade-left"
                        data-aos-delay="200"
                    />
                </div>

                {/* Subject Field */}
                <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    className={"input fullWidth"}
                    data-aos="fade-up"
                    data-aos-delay="300"
                />

                {/* Message Field */}
                <textarea
                    name="message"
                    placeholder="Your Message"
                    rows={5}
                    required
                    className={"input textarea fullWidth"}
                    data-aos="fade-up"
                    data-aos-delay="400"
                ></textarea>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={"submitButton"}
                    data-aos="zoom-in"
                    data-aos-delay="500"
                >
                    Send Message
                </button>
            </form>
        </section>
    );
}