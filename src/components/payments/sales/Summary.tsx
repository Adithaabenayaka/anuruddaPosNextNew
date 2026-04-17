import { SaleStatus } from "@/src/types/sale";
import { ShoppingCart, Trash2, CreditCard, ClipboardList, Wallet, FileText, Wallet2 } from "lucide-react";
import Button from "@/src/components/Button";
import CartItemRow from "@/src/common/CartItemRow";
import { useCart } from "@/src/context/CartContext";
import { generateInvoicePDF, InvoiceData } from "@/src/services/pdfService";
import { useEffect } from "react";

interface SummaryProps {
    paidAmount: number;
    setPaidAmount: (amount: string) => void;
    isQuotation: boolean;
    setIsQuotation: (isQuotation: boolean) => void;
    handleCheckout: () => void;
    handleSaveDraft: () => void;
    isProcessing: boolean;
    derivedStatus: SaleStatus;
    balanceAmount: number;
    buyerName: string;
    address1: string;
    address2: string;
}


const Summary = ({ paidAmount, setPaidAmount, isQuotation, setIsQuotation, handleCheckout, handleSaveDraft, isProcessing, derivedStatus, balanceAmount, buyerName, address1, address2 }: SummaryProps) => {
    const { cart, cartTotal, clearCart, removeFromCart } = useCart();


    useEffect(() => { console.log(cart) }, [cart])
    const handleCleanCart = () => {
        clearCart();
    }

    return (
        <div className="lg:col-span-6 sticky top-20">
            <div className="bg-white rounded-lg shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col">
                <header className="bg-gray-900 px-5 py-4 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingCart size={18} className="text-primary-400" />
                                Summary
                            </h2>
                            <p className="text-gray-400 text-[10px] mt-0.5">Tax Invoice Breakdown</p>
                        </div>
                        <div>

                            <div className="bg-primary-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-primary-100">
                                <ShoppingCart className="text-primary-600" size={14} />
                                <span className="text-primary-900 font-bold text-xs">{cart.length} Items Selected</span>
                            </div>
                        </div>

                    </div>


                </header>

                {/* Header for Desktop Table */}
                <div className="hidden md:grid md:grid-cols-12 md:gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest no-print">
                    <div className="col-span-3 flex items-center gap-2">
                        <FileText size={12} className="text-gray-400" />
                        Item / Batch
                    </div>
                    <div className="col-span-1 text-right">Cost</div>
                    <div className="col-span-1 text-right">Orig.</div>
                    <div className="col-span-1 text-right">S. Price</div>
                    <div className="col-span-2 text-right">Manual Pr.</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1"></div>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 max-h-[450px] overflow-y-auto">
                    {cart.length > 0 ? (
                        <div className="space-y-3 mt-3">
                            {cart.map((item) => (
                                <CartItemRow
                                    key={item.id + (item.batchId || "")}
                                    item={item}
                                />
                            ))}

                        </div>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center gap-3">
                            <ShoppingCart className="text-gray-100" size={48} />
                            <p className="text-gray-300 text-xs font-bold uppercase tracking-[0.2em]">Your cart is empty</p>
                        </div>
                    )}
                </div>

                {/* Footer Summary */}
                <footer className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Subtotal</span>
                        <span className="text-sm font-black text-gray-900">Rs. {cartTotal.toLocaleString()}</span>
                    </div>

                    {/* Updated Payment Input & Toggle */}
                    <div className="space-y-3 mb-4">
                        {!isQuotation && (
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                    Cash Received
                                    {paidAmount !== cartTotal && (
                                        <button className="text-primary-600 font-black hover:underline lowercase" onClick={() => setPaidAmount(cartTotal.toString())}>Reset to Full</button>
                                    )}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">Rs.</span>
                                    <input
                                        type="number"
                                        value={paidAmount || ''}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all text-sm font-bold text-gray-900"
                                    />
                                </div>
                            </div>
                        )}

                        <div
                            onClick={() => setIsQuotation(!isQuotation)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${isQuotation ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                            <div className="flex items-center gap-2">
                                <ClipboardList size={14} className={isQuotation ? 'text-emerald-600' : 'text-gray-300'} />
                                <span className="text-[9px] font-black uppercase tracking-wider">Mark as Quotation</span>
                            </div>
                            <div className={`w-7 h-4 rounded-full relative transition-colors ${isQuotation ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isQuotation ? 'right-0.5' : 'left-0.5'}`} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200/60 mb-5 space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Net Total</span>
                            <span className="text-sm font-black text-gray-900">Rs. {cartTotal.toLocaleString()}</span>
                        </div>
                        {!isQuotation && balanceAmount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Balance (Credit)</span>
                                <span className="text-sm font-black text-amber-600">Rs. {balanceAmount.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <div className={`flex grid ${isQuotation ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-3`}>
                        {/* <Button
                            variant="primary"
                            className="!bg-gray-100 text-gray-600 hover:!bg-gray-200 !rounded-xl h-11 !shadow-none !text-[10px] !font-black uppercase tracking-wider px-4"
                            onClick={() => generateInvoicePDF(invoiceData)}
                            isLoading={isProcessing}
                            title="Generate PDF"
                        >
                            <FileText size={16} color="white" />
                            PDF
                        </Button> */}
                        {!isQuotation && (
                            <Button
                                variant="primary"
                                className="!bg-gray-100 text-gray-600 hover:!bg-gray-200 !rounded-xl h-11 !shadow-none !text-[10px] !font-black uppercase tracking-wider px-4"
                                onClick={handleSaveDraft}
                                isLoading={isProcessing}
                                title="Save as Draft"
                            >
                                <FileText size={16} color="white" />
                                Draft
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            className="!bg-gray-100 text-gray-600 hover:!bg-gray-200 !rounded-xl h-11 !shadow-none !text-[10px] !font-black uppercase tracking-wider px-4"
                            onClick={handleCleanCart}
                            isLoading={isProcessing}
                            title="Clean Cart"
                        >
                            <Trash2 size={16} color="white" />
                            Clean                        </Button>
                    </div>

                    <div className={`flex gap-2 mb-3`}>
                        <Button
                            variant="primary"
                            className={`flex-1 !rounded-xl h-11 !shadow-none !text-xs !font-black uppercase tracking-[0.1em] ${isQuotation ? '!bg-emerald-600 hover:!bg-emerald-700' : derivedStatus === 'pending-payment' ? '!bg-amber-500 hover:!bg-amber-600 border-amber-500' : ''}`}
                            onClick={handleCheckout}
                            isLoading={isProcessing}
                            leftIcon={!isProcessing && (
                                isQuotation ? <ClipboardList size={14} /> :
                                    derivedStatus === 'pending-payment' ? <Wallet size={14} /> :
                                        <CreditCard size={14} />
                            )}
                        >
                            {isProcessing ? "Processing..." :
                                isQuotation ? "Issue Quote" :
                                    derivedStatus === 'pending-payment' ? "Part Payment / Credit" :
                                        "Complete Order"}
                        </Button>


                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Summary