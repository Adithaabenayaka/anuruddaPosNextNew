import { SaleItem, SaleStatus } from "@/src/types/sale";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ClipboardList, Wallet, CheckCircle2, FileText, Printer, ArrowRight } from "lucide-react";
import Button from "@/src/components/Button";

interface SummaryProps {
    cart: SaleItem[];
    cartTotal: number;
    paidAmount: number;
    setPaidAmount: (amount: number) => void;
    isQuotation: boolean;
    setIsQuotation: (isQuotation: boolean) => void;
    removeFromCart: (id: string, batchId?: string) => void;
    updateQty: (id: string, qty: number, batchId?: string) => void;
    handleCheckout: () => void;
    handleSaveDraft: () => void;
    isProcessing: boolean;
    derivedStatus: SaleStatus;
    balanceAmount: number;
}


const Summary = ({ cart, cartTotal, paidAmount, setPaidAmount, isQuotation, setIsQuotation, removeFromCart, updateQty, handleCheckout, handleSaveDraft, isProcessing, derivedStatus, balanceAmount }: SummaryProps) => {


    return (
        <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col">
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

                {/* Cart Items List */}
                <div className="p-4 flex-1 max-h-[350px] overflow-y-auto space-y-3">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                            <div key={item.id + (item.batchId || '')} className="flex flex-col gap-1.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-xs text-gray-900">{item.productName}</p>
                                        {item.batchLabel && <p className="text-[9px] text-primary-500 font-bold uppercase tracking-tighter">{item.batchLabel}</p>}
                                        <div className="flex items-center gap-1.5">
                                            {item.originalPrice && item.originalPrice !== item.price && (
                                                <p className="text-[9px] text-gray-400 line-through">Rs. {item.originalPrice.toLocaleString()}</p>
                                            )}
                                            <p className="text-[10px] font-semibold text-gray-600">@ Rs. {item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id, item.batchId ?? undefined)}
                                        className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm scale-90 origin-left">
                                        <button onClick={() => updateQty(item.id, -1, item.batchId ?? undefined)} className="p-1 px-2 hover:bg-gray-100 border-r border-gray-100 text-gray-500"><Minus size={12} /></button>
                                        <span className="px-2 font-black text-xs min-w-[30px] text-center text-primary-600">{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1, item.batchId ?? undefined)} className="p-1 px-2 hover:bg-gray-100 border-l border-gray-100 text-gray-500"><Plus size={12} /></button>
                                    </div>
                                    <p className="font-black text-gray-900 text-sm">
                                        Rs. {(item.price * item.qty).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-gray-300">
                            <p className="text-[10px] font-medium tracking-tight">Cart is empty</p>
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
                                        <button className="text-primary-600 font-black hover:underline lowercase" onClick={() => setPaidAmount(cartTotal)}>Reset to Full</button>
                                    )}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">Rs.</span>
                                    <input
                                        type="number"
                                        value={paidAmount || ''}
                                        onChange={(e) => setPaidAmount(Number(e.target.value))}
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

                    <div className="flex gap-2 mb-3">
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

                        {!isQuotation && (
                            <Button
                                variant="primary"
                                className="!bg-gray-100 !text-gray-600 hover:!bg-gray-200 !rounded-xl h-11 !shadow-none !text-[10px] !font-black uppercase tracking-wider px-4"
                                onClick={handleSaveDraft}
                                isLoading={isProcessing}
                                title="Save as Draft"
                            >
                                <FileText size={16} />
                            </Button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Summary