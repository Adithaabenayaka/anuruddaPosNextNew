import { SaleItem, SaleStatus } from "@/src/types/sale";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ClipboardList, Wallet, CheckCircle2, FileText, Printer, ArrowRight } from "lucide-react";
import Button from "@/src/components/Button";

interface SummaryProps {
    cart: SaleItem[];
    cartTotal: number;
    paidAmount: string;
    setPaidAmount: (amount: string) => void;
    isQuotation: boolean;
    setIsQuotation: (isQuotation: boolean) => void;
    removeFromCart: (id: string, batchId?: string) => void;
    updateQty: (id: string, qty: number, batchId?: string) => void;
    updatePrice: (id: string, price: string, batchId?: string) => void;
    handleCheckout: () => void;
    handleSaveDraft: () => void;
    handleCleanCart: () => void;
    isProcessing: boolean;
    derivedStatus: SaleStatus;
    balanceAmount: number;
}


const Summary = ({ cart, cartTotal, paidAmount, setPaidAmount, isQuotation, setIsQuotation, removeFromCart, updateQty, updatePrice, handleCheckout, handleSaveDraft, handleCleanCart, isProcessing, derivedStatus, balanceAmount }: SummaryProps) => {


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

                {/* Cart Items List */}
                <div className="p-3 flex-1 max-h-[350px] overflow-y-auto">
                    {cart.length > 0 ? (
                        <div className="space-y-2">
                            {cart.map((item) => (
                                <div
                                    key={item.id + (item.batchId || "")}
                                    className="flex flex-col gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm md:grid md:grid-cols-12 md:items-center md:gap-4 md:px-3 md:py-2 md:text-xs md:shadow-none md:border-transparent md:border-b"
                                >
                                    {/* Product & Remove (Mobile) */}
                                    <div className="flex justify-between items-start md:col-span-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-[14px] md:text-xs truncate">
                                                {item.productName}
                                            </span>
                                            {item.batchLabel && (
                                                <span className="text-[10px] md:text-[9px] text-primary-500 font-bold uppercase tracking-wider">
                                                    {item.batchLabel}  -  ({item.cost})
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() =>
                                                removeFromCart(item.id, item.batchId ?? undefined)
                                            }
                                            className="md:hidden text-gray-400 hover:text-rose-500 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Controls & Prices Container */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-7 md:grid md:grid-cols-7 md:gap-2">
                                        {/* Price Input */}
                                        <div className="w-[100px] md:col-span-2 md:w-auto">
                                            <div className="relative">
                                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] md:text-[8px] text-gray-400 font-bold">Rs.</span>
                                                <input
                                                    type="number"
                                                    value={item.price || ''}
                                                    onChange={(e) =>
                                                        updatePrice(
                                                            item.id,
                                                            e.target.value,
                                                            item.batchId ?? undefined
                                                        )
                                                    }
                                                    onFocus={(e) => e.target.select()}
                                                    className={`w-full text-right border rounded-lg md:rounded-md pl-6 pr-2 py-2 md:py-1 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none transition-all text-sm md:text-xs ${parseFloat(item.price || "0") <= item.cost
                                                        ? "border-rose-500 text-rose-600 bg-rose-50 focus:ring-rose-100"
                                                        : "border-gray-200 text-gray-700 focus:ring-primary-100"
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Qty Control with Buttons */}
                                        <div className="flex items-center gap-1 md:col-span-2 md:justify-center">
                                            <button
                                                onClick={() => updateQty(item.id, Math.max(1, item.qty - 1), item.batchId ?? undefined)}
                                                className="w-10 h-10 md:w-7 md:h-7 flex items-center justify-center rounded-lg md:rounded-md border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 active:scale-90 transition-all shadow-sm"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.qty}
                                                onChange={(e) =>
                                                    updateQty(
                                                        item.id,
                                                        Number(e.target.value),
                                                        item.batchId ?? undefined
                                                    )
                                                }
                                                className="w-12 md:w-10 text-center border border-transparent font-black text-primary-600 focus:outline-none bg-transparent text-lg md:text-xs"
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <button
                                                onClick={() => updateQty(item.id, item.qty + 1, item.batchId ?? undefined)}
                                                className="w-10 h-10 md:w-7 md:h-7 flex items-center justify-center rounded-lg md:rounded-md border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 active:scale-90 transition-all shadow-sm"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Total */}
                                        <div className="text-right font-black text-gray-900 text-[15px] md:text-xs md:col-span-2">
                                            Rs. {(Number(item.price) * item.qty).toLocaleString()}
                                        </div>

                                        {/* Remove (Desktop) */}
                                        <div className="hidden md:flex md:col-span-1 justify-end">
                                            <button
                                                onClick={() =>
                                                    removeFromCart(item.id, item.batchId ?? undefined)
                                                }
                                                className="text-gray-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center text-gray-300 text-xs">
                            Cart is empty
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
                                    {parseFloat(paidAmount) !== cartTotal && (
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
                        {!isQuotation && (
                            <Button
                                variant="primary"
                                className="!bg-gray-100 text-gray-600 hover:!bg-gray-200 !rounded-xl h-11 !shadow-none !text-[10px] !font-black uppercase tracking-wider px-4"
                                onClick={handleSaveDraft}
                                isLoading={isProcessing}
                                title="Save as Draft"
                            >
                                <FileText size={16} color="white" />
                                Save as Draft
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
                            Clean Cart
                        </Button>
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