"use client";
import { useCart } from "@/src/context/CartContext";
import { generateInvoicePDF } from "@/src/services/pdfService";
import { useEffect } from "react";
import { CartItem } from "@/src/context/CartContext";

export default function AddingPage() {

    const { cart, addToCart } = useCart();

    useEffect(() => { console.log(cart) }, [cart])

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

    const handleClick = () => {

        const cart1: CartItem = {
            id: "",
            productId: "",
            productName: "",
            price: "",
            cost: 44,
            qty: 0
        }
        addToCart(cart1)
    }

    return (
        <div>
            {/* <button onClick={handleGenerate}>Add Product</button> */}
            <button onClick={handleClick}>cart</button>
            {cart && cart[0]?.cost}
        </div>
    )
}
