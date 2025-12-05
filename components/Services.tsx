import { InfoCards } from "./InfoCards"
import "@/styles/Services.scss"

const ServiceItems = [
    {
        id: 1,
        image: "/services/parcel.png",
        heading: "Parcel Delivery",
        writeUp: "Our local parcel delivery service ensures your packages reach their destination quickly and safely within your city or region. Whether it’s documents, personal items, or small parcels, we offer reliable, same-day or next-day delivery options. With real-time tracking, professional handling, and affordable rates, sending parcels locally has never been easier or more convenient."
    },
    {
        id: 2,
        image: "/services/cargo.png",
        heading: "Cargo and shipment",
        writeUp: "Our local parcel delivery service ensures your packages reach their destination quickly and safely within your city or region. Whether it’s documents, personal items, or small parcels, we offer reliable, same-day or next-day delivery options. With real-time tracking, professional handling, and affordable rates, sending parcels locally has never been easier or more convenient."
    },
    {
        id: 3,
        image: "/services/shipping.png",
        heading: "International Shipping",
        writeUp: "Our local parcel delivery service ensures your packages reach their destination quickly and safely within your city or region. Whether it’s documents, personal items, or small parcels, we offer reliable, same-day or next-day delivery options. With real-time tracking, professional handling, and affordable rates, sending parcels locally has never been easier or more convenient."
    },
    {
        id: 4,
        image: "/services/storage.png",
        heading: "Warehousing",
        writeUp: "Our local parcel delivery service ensures your packages reach their destination quickly and safely within your city or region. Whether it’s documents, personal items, or small parcels, we offer reliable, same-day or next-day delivery options. With real-time tracking, professional handling, and affordable rates, sending parcels locally has never been easier or more convenient."
    }
]

export const Services = () => {
    return (
        <section className="info-cards-section">
            <h1>Our Services include:</h1>
            <div>
                {ServiceItems.map((item) => (
                    <InfoCards
                        key={item.id}
                        image={item.image}
                        writeUp={item.writeUp}
                        heading={item.heading}
                        buttonRef="/"
                    />
                ))}
            </div>
        </section>
    )
}