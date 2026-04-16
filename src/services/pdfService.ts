import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export interface SaleItem {
    id: string;
    productId: string;
    productName: string;
    price: string; // string → will convert
    originalPrice?: number | null;
    catalogPrice?: number | null;
    cost: number;
    qty: number;
    batchId?: string | null;
    batchLabel?: string | null;
}

export type InvoiceData = {
    customer: {
        name: string;
        address1: string;
        address2: string;
    };
    items: SaleItem[];
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    balance: number;
    isQuatation: boolean
};

// =========================
// HELPER
// =========================
const toNumber = (value: string | number | undefined | null) => {
    if (!value) return 0;
    return typeof value === "string" ? parseFloat(value) : value;
};

export const formatMoney = (amount: number) => {
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};


// =========================
// MAIN FUNCTION
// =========================
export const generateInvoicePDF = (data: InvoiceData) => {
    const logo = new Image();
    logo.src = "/logo.png";

    const totalDiscount = data.items.reduce((acc, item) => {
        const price = toNumber(item.price);
        const discount =
            item.originalPrice && item.originalPrice > price
                ? (item.originalPrice - price) * item.qty
                : 0;
        return acc + discount;
    }, 0);

    console.log(totalDiscount)

    logo.onload = () => {
        const doc = new jsPDF();

        // Add logo first
        doc.addImage(logo, "PNG", 20, 13, 30, 30);

        // =========================
        // HEADER
        // =========================

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("APEX OFFICE SOLUTIONS", 54, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Kotalawala, Bandaragama", 54, 26);
        doc.text("Phone 038 22 91 581", 54, 31);
        doc.text("Mobile 070 62 62 434", 54, 36);

        doc.text(new Date().toLocaleDateString(), 170, 55);

        doc.line(20, 42, 190, 42);

        // =========================
        // TITLE
        // =========================
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(
            data.isQuatation ? "QUOTATION" : "INVOICE",
            20,
            55,
            { align: "left" }
        );

        // =========================
        // BILL TO
        // =========================
        doc.setFontSize(11);
        doc.text("BILL TO", 20, 65);

        doc.setFont("helvetica", "normal");
        doc.text(data.customer.name, 20, 72);
        doc.text(data.customer.address1, 20, 78);
        doc.text(data.customer.address2, 20, 84);

        // =========================
        // TABLE DATA
        // =========================
        const tableBody = data.items.map((item) => {
            const price = toNumber(item.price);
            const qty = item.qty;
            const amount = price * qty;

            const discount =
                item.originalPrice && item.originalPrice > price
                    ? (item.originalPrice - price) * qty
                    : 0;

            return [
                item.productName,
                qty.toString(),
                (formatMoney(Number(item.originalPrice?.toFixed(2))) || formatMoney(Number(price.toFixed(2)))), // MRP
                formatMoney(Number(price.toFixed(2))), // Rate
                formatMoney(Number(discount.toFixed(2))),
                formatMoney(Number(amount.toFixed(2))),
            ];
        });

        // TOTAL ROW
        tableBody.push([
            "TOTAL",
            "",
            "",
            "",
            formatMoney(Number(data.discount.toFixed(2))),
            formatMoney(Number(data.total.toFixed(2))),
        ]);

        autoTable(doc, {
            startY: 95,
            margin: { left: 20, right: 20 },
            head: [["ITEM", "QTY", "MRP", "RATE", "DISCOUNT", "AMOUNT"]],
            body: tableBody,
            theme: "plain",

            styles: {
                fontSize: 10,
                cellPadding: 2,
                lineWidth: 0,
                halign: "center",
            },

            columnStyles: {
                0: { halign: "left" },   // ITEM 👈
                5: { halign: "right" },  // AMOUNT 👈
            },



            didDrawCell: (data) => {
                const { doc, cell } = data;

                // Draw only bottom border (horizontal line)
                doc.setDrawColor(200); // light gray
                doc.setLineWidth(0.2);
                doc.line(
                    cell.x,
                    cell.y + cell.height,
                    cell.x + cell.width,
                    cell.y + cell.height
                );
            },

            didParseCell: (hookData) => {
                // Bold TOTAL row
                if (hookData.row.index === tableBody.length - 1) {
                    hookData.cell.styles.fontStyle = "bold";
                }
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY;

        // =========================
        // TOTAL SUMMARY
        // =========================
        doc.setFont("helvetica", "normal");

        // doc.text("Subtotal", 140, finalY + 10);
        // doc.text(formatMoney(Number(data.subtotal.toFixed(2))), 190, finalY + 10, { align: "right" });

        // doc.text("Discount", 140, finalY + 16);
        // doc.text(`- ${formatMoney(Number(data.discount.toFixed(2)))}`, 190, finalY + 16, { align: "right" });

        doc.setFont("helvetica", "bold");
        doc.text("Total", 140, finalY + 10);
        doc.text(formatMoney(Number(data.total.toFixed(2))), 190, finalY + 10, { align: "right" });


        // Bank Details
        if (!data.isQuatation) {
            doc.setFont("helvetica", "normal");
            doc.text("Paid", 140, finalY + 16);
            doc.text(formatMoney(Number(data.paid.toFixed(2))), 190, finalY + 16, { align: "right" });

            doc.text("Balance", 140, finalY + 22);
            doc.text(formatMoney(Number(data.balance.toFixed(2))), 190, finalY + 22, { align: "right" });


            doc.setFont("helvetica", "bold");
            doc.text("Bank Details", 20, finalY + 30 + 10);

            doc.setFont("helvetica", "normal");
            doc.text("HD Pemarathna", 20, finalY + 30 + 16);
            doc.text("93563181", 20, finalY + 30 + 22);
            doc.text("Bank of Ceylon - Horana", 20, finalY + 30 + 28);

            // Terms and Conditions
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10)
            doc.setTextColor(117, 117, 117);
            doc.text("TERMS", 20, finalY + 30 + 42);

            doc.setFont("helvetica", "normal");
            doc.text("INVOICE REQUIRED FOR WARRANTY CLAIMS", 20, finalY + 30 + 48);


            // =========================
            // SAVINGS TEXT
            // =========================
            doc.setTextColor(0, 128, 0);
            doc.text(`You saved ${formatMoney(Number(data.discount.toFixed(2)))}`, 140, finalY + 34);
            doc.setTextColor(0, 0, 0);

        }

        if (data.isQuatation) {
            doc.setFont("helvetica", "normal");
            doc.text("Note:", 20, finalY + 30);
            doc.text("This Quotation valid only for 10 Days from the date of issued", 20, finalY + 36);
        }


        // =========================
        // SAVE PDF
        // =========================
        doc.save(`${data.customer.name}_Invoice.pdf`);
    }


};