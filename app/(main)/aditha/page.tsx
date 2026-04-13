"use client";
import { jsPDF } from "jspdf";


export default function AddingPage() {


    const savePDF = (name: string) => {
        const doc = new jsPDF();

        doc.text(`Hello ${name}`, 10, 10);
        doc.save("a4.pdf");
    }
    return (
        <div>
            <button onClick={() => savePDF("Aditha")}>Add Product</button>
        </div>
    )
}
