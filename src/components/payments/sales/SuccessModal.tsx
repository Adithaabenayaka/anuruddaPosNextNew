
"use client";

import { ShoppingCart, User, Plus, CheckCircle2, Printer, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Sale } from "@/src/types/sale";
import Button from "@/src/components/Button";
import CloseButton from "@/src/components/CloseButton";

interface SuccessModalProps {
    lastProcessedSale: Sale;
    setShowSuccessModal: (show: boolean) => void;
    setLastProcessedSale: (sale: Sale | null) => void;
}
const SuccessModal = ({ lastProcessedSale, setShowSuccessModal, setLastProcessedSale }: SuccessModalProps) => {
    const router = useRouter();
    const handleDownloadPDF = async () => {
        try {
            // @ts-ignore - Dynamic import to handle non-TS library in Next.js client component
            const html2pdf = (await import('html2pdf.js')).default;
            const element = document.getElementById('receipt-content');

            if (!element) {
                alert("Receipt content not found. Please try again.");
                return;
            }

            const fileName = `${lastProcessedSale.status === 'quotation' ? 'Quote' : 'Invoice'}_${lastProcessedSale.buyerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            const opt = {
                margin: 10,
                filename: fileName,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    onclone: (clonedDoc: Document) => {
                        // Inject a "sterile" stylesheet into the cloned document to override 
                        // modern Tailwind v4 variables (oklch/oklab) with standard Hex codes.
                        const style = clonedDoc.createElement('style');
                        style.innerHTML = `
                            :root {
                                --color-gray-50: #f9fafb !important;
                                --color-gray-100: #f3f4f6 !important;
                                --color-gray-200: #e5e7eb !important;
                                --color-gray-300: #d1d5db !important;
                                --color-gray-400: #9ca3af !important;
                                --color-gray-500: #6b7280 !important;
                                --color-gray-600: #4b5563 !important;
                                --color-gray-700: #374151 !important;
                                --color-gray-800: #1f2937 !important;
                                --color-gray-900: #111827 !important;
                                --color-primary-50: #fff4e8 !important;
                                --color-primary-500: #ff9025 !important;
                                --color-primary-600: #e67f1f !important;
                                --color-emerald-50: #ecfdf5 !important;
                                --color-emerald-100: #d1fae5 !important;
                                --color-emerald-200: #a7f3d0 !important;
                                --color-emerald-500: #10b981 !important;
                                --color-emerald-600: #059669 !important;
                                --color-emerald-700: #047857 !important;
                                --color-emerald-900: #064e3b !important;
                                --color-white: #ffffff !important;
                                --color-black: #000000 !important;
                            }
                        `;
                        clonedDoc.head.appendChild(style);
                    }
                },
                jsPDF: {
                    unit: 'mm' as const,
                    format: 'a4' as const,
                    orientation: lastProcessedSale.status === 'quotation' ? 'landscape' as const : 'portrait' as const
                }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF. Please use the Print button instead.");
        }
    };

    return (
        <div className="no-print fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" />

            <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
                <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500" size={20} />
                            {lastProcessedSale.status === 'quotation' ? 'Quotation Issued' : 'Sale Completed'}
                        </h2>
                        <p className="text-[10px] text-mono text-gray-400 mt-0.5 uppercase tracking-tighter">
                            ID: #{lastProcessedSale.id?.toUpperCase()} • {new Date().toLocaleDateString()}
                        </p>
                    </div>
                    <CloseButton onClick={() => {
                        setShowSuccessModal(false);
                        setLastProcessedSale(null);
                    }} />
                </header>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Customer Info */}
                    <section className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-0.5">Customer / Buyer</p>
                                <p className="text-base font-black text-emerald-900">{lastProcessedSale.buyerName}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-0.5">Status</p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-emerald-100 text-emerald-700 border-emerald-200`}>
                                {lastProcessedSale.status === 'completed' ? 'Paid' : lastProcessedSale.status === 'pending-payment' ? 'Unpaid' : 'Offer'}
                            </span>
                        </div>
                    </section>

                    {/* Items List */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <ShoppingCart size={14} className="text-gray-400" />
                            Order Summary
                        </h3>
                        <div className="space-y-2">
                            {lastProcessedSale.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:bg-white transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-md border border-gray-200 flex items-center justify-center font-bold text-gray-400 group-hover:text-primary-600 group-hover:border-primary-200 transition-colors text-xs">
                                            {item.qty}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-xs">{item.productName}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {item.originalPrice && Number(item.originalPrice) !== Number(item.price) && (
                                                    <p className="text-[8px] text-gray-400 line-through">Rs. {item.originalPrice.toLocaleString()}</p>
                                                )}
                                                <p className="text-[9px] text-gray-600 font-medium">Rs. {item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-gray-900 font-black text-xs">
                                        Rs. {(Number(item.price) * Number(item.qty)).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="border-t border-dashed border-gray-200 pt-5">
                        <div className="flex justify-between items-center px-2">
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Net Total</p>
                            <p className="text-2xl font-black text-emerald-600">
                                Rs. {lastProcessedSale.total.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            className="w-full sm:w-auto !bg-white !text-gray-600 !h-10 !rounded-xl !text-[10px] !font-black uppercase tracking-widest border border-gray-200 hover:!bg-gray-100 shadow-sm"
                            onClick={() => {
                                setShowSuccessModal(false);
                                setLastProcessedSale(null);
                            }}
                            leftIcon={<Plus size={14} />}
                        >
                            New Sale
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            variant="primary"
                            className="w-full sm:w-auto !h-10 !rounded-xl !text-[10px] !font-black uppercase tracking-widest !bg-white !text-gray-600 border border-gray-200 hover:!bg-gray-100 shadow-sm"
                            onClick={handleDownloadPDF}
                            leftIcon={<Plus size={16} className="text-primary-600" />}
                        >
                            Download PDF
                        </Button>

                        <Button
                            variant="primary"
                            className="w-full sm:w-auto !h-10 !rounded-xl !text-[11px] !font-black uppercase tracking-widest shadow-lg shadow-primary-200"
                            onClick={() => window.print()}
                            leftIcon={<Printer size={16} />}
                        >
                            Print Receipt
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default SuccessModal