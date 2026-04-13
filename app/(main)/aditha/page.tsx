"use client";
import { generateInvoicePDF } from "@/src/services/pdfService";


export default function AddingPage() {

    const handleGenerate = () => {
        generateInvoicePDF({
            customer: {
                name: "Aditha abeynayaka",
                address1: "1/79 Raigama",
                address2: "Bandaragama",
            },
            items: [
                {
                    name: "A4 King Copy 80GSM - 500 sheets",
                    qty: 2,
                    mrp: 1250,
                    discount: 44,
                    rate: 1115,
                    amount: 2230,
                },
                {
                    name: "Pen Blue",
                    qty: 3,
                    discount: 45,
                    mrp: 50,
                    rate: 45,
                    amount: 135,
                },
            ],
            subtotal: 2365,
            discount: 200,
            total: 2165,
            paid: 2165,
            balance: 0,
        });
    };

    return (
        <div>
            <button onClick={handleGenerate}>Add Product</button>
        </div>
    )
}
