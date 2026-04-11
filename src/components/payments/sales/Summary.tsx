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
                        <div className="divide-y divide-gray-50">
                            {cart.map((item) => (
                                <div
                                    key={item.id + (item.batchId || "")}
                                    className="flex flex-col gap-3 p-4 bg-white md:grid md:grid-cols-12 md:items-center md:gap-4 md:px-6 md:py-3 transition-colors hover:bg-gray-50/50"
                                >
                                    {/* Product & Remove (Mobile) */}
                                    <div className="flex justify-between items-start md:col-span-3">
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-gray-900 text-[15px] md:text-sm truncate">
                                                {item.productName}
                                            </span>
                                            <div className="flex flex-wrap gap-2 mt-0.5">
                                                {item.batchLabel && (
                                                    <span className="text-[10px] md:text-[9px] bg-primary-50 text-primary-600 font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary-100">
                                                        {item.batchLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                removeFromCart(item.id, item.batchId ?? undefined)
                                            }
                                            className="md:hidden text-gray-400 hover:text-rose-500 transition-colors p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Mobile-only Metadata Grid */}
                                    <div className="md:hidden grid grid-cols-3 gap-2 py-2 border-y border-gray-50 bg-gray-50/50 px-2.5 rounded-xl text-[10px]">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 font-black uppercase tracking-tighter text-[8px]">Cost</span>
                                            <span className="font-bold text-gray-600">Rs. {item.cost.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col border-x border-gray-100 px-2">
                                            <span className="text-gray-400 font-black uppercase tracking-tighter text-[8px]">Orig.</span>
                                            <span className="font-bold text-gray-500">{item.originalPrice ? `Rs. ${item.originalPrice.toLocaleString()}` : '-'}</span>
                                        </div>
                                        <div className="flex flex-col pl-1">
                                            <span className="text-gray-400 font-black uppercase tracking-tighter text-[8px]">Catalog</span>
                                            <span className="font-bold text-primary-500">{item.catalogPrice ? `Rs. ${item.catalogPrice.toLocaleString()}` : '-'}</span>
                                        </div>
                                    </div>

                                    {/* Cost (Desktop) */}
                                    <div className="hidden md:block md:col-span-1 text-right text-[11px] font-bold text-gray-400">
                                        Rs. {item.cost.toLocaleString()}
                                    </div>

                                    {/* Original Price (Desktop) */}
                                    <div className="hidden md:block md:col-span-1 text-right text-[11px] font-bold text-gray-400">
                                        {item.originalPrice ? `Rs. ${item.originalPrice.toLocaleString()}` : '-'}
                                    </div>

                                    {/* Catalog Selling Price (Desktop) */}
                                    <div className="hidden md:block md:col-span-1 text-right text-[11px] font-bold text-primary-500">
                                        {item.catalogPrice ? `Rs. ${item.catalogPrice.toLocaleString()}` : '-'}
                                    </div>

                                    {/* Controls & Prices Container */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-6 md:grid md:grid-cols-6 md:gap-4">
                                        {/* Selling Price Input */}
                                        <div className="w-[120px] md:col-span-2 md:w-auto">
                                            <label className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Manual Price</label>
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] md:text-[9px] text-gray-400 font-bold">Rs.</span>
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
                                                    className={`w-full text-right border rounded-xl md:rounded-lg pl-8 pr-2.5 py-2.5 md:py-1.5 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none transition-all text-[15px] md:text-sm ${parseFloat(item.price || "0") <= item.cost
                                                        ? "border-rose-500 text-rose-600 bg-rose-50 focus:ring-rose-100"
                                                        : "border-gray-200 text-gray-900 focus:border-primary-300 focus:ring-4 focus:ring-primary-50"
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Qty Control with Buttons */}
                                        <div className="md:col-span-2 flex flex-col md:items-center">
                                            <label className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Quantity</label>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => updateQty(item.id, Math.max(1, item.qty - 1), item.batchId ?? undefined)}
                                                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-xl md:rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
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
                                                    className="w-14 md:w-10 text-center border-0 font-black text-primary-600 focus:outline-none bg-transparent text-xl md:text-sm"
                                                    onFocus={(e) => e.target.select()}
                                                />
                                                <button
                                                    onClick={() => updateQty(item.id, item.qty + 1, item.batchId ?? undefined)}
                                                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-xl md:rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="md:col-span-1 text-right flex flex-col md:items-end">
                                            <label className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Subtotal</label>
                                            <span className="font-black text-gray-900 text-lg md:text-sm">
                                                Rs. {(parseFloat(item.price || "0") * item.qty).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Remove (Desktop) */}
                                        <div className="hidden md:flex md:col-span-1 justify-end">
                                            <button
                                                onClick={() =>
                                                    removeFromCart(item.id, item.batchId ?? undefined)
                                                }
                                                className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
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