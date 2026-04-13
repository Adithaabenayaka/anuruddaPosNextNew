import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type InvoiceItem = {
    name: string;
    qty: number;
    mrp: number;
    rate: number;
    discount: number;
    amount: number;
};

export type InvoiceData = {
    customer: {
        name: string;
        address1: string;
        address2: string;
    };
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    balance: number;
};

export const generateInvoicePDF = (data: InvoiceData) => {
    const doc = new jsPDF();

    // =========================
    // HEADER
    // =========================
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("APEX OFFICE SOLUTIONS", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Kotalawala, Bandaragama", 20, 26);
    doc.text("Phone 038 22 91 581", 20, 31);
    doc.text("Mobile 070 62 62 434", 20, 36);

    doc.text(new Date().toLocaleDateString(), 170, 20);

    doc.line(20, 42, 190, 42);

    // =========================
    // TITLE
    // =========================
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 20, 55);

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
    const tableBody = data.items.map(item => [
        item.name,
        item.qty.toString(),
        item.mrp.toFixed(2),
        item.rate.toFixed(2),
        item.discount.toFixed(2),
        item.amount.toFixed(2),
    ]);

    // TOTAL ROW
    tableBody.push([
        "TOTAL",
        "",
        "",
        "",
        data.discount.toFixed(2),
        data.total.toFixed(2),
    ]);

    autoTable(doc, {
        startY: 95,
        margin: { left: 20, right: 20 },
        head: [["ITEM", "QTY", "MRP", "RATE", "DISCOUNT", "AMOUNT"]],
        body: tableBody,
        theme: "striped",

        styles: {
            fontSize: 10,
            cellPadding: 2,
        },

        columnStyles: {
            1: { halign: "right" },
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
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

    doc.text("Subtotal", 140, finalY + 10);
    doc.text(data.subtotal.toFixed(2), 190, finalY + 10, { align: "right" });

    doc.text("Discount", 140, finalY + 16);
    doc.text(`- ${data.discount.toFixed(2)}`, 190, finalY + 16, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Total", 140, finalY + 24);
    doc.text(data.total.toFixed(2), 190, finalY + 24, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text("Paid", 140, finalY + 30);
    doc.text(data.paid.toFixed(2), 190, finalY + 30, { align: "right" });

    doc.text("Balance", 140, finalY + 36);
    doc.text(data.balance.toFixed(2), 190, finalY + 36, { align: "right" });

    // =========================
    // SAVINGS TEXT
    // =========================
    doc.setTextColor(0, 128, 0);
    doc.text(`You saved ${data.discount.toFixed(2)}`, 140, finalY + 46);
    doc.setTextColor(0, 0, 0);

    // =========================
    // SAVE PDF
    // =========================
    doc.save(`${data.customer.name}_Invoice.pdf`);
};