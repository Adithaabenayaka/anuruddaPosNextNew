
"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { SaleItem } from "@/src/types/sale";

interface Props {
    item: SaleItem;
    updateQty: (id: string, qty: number, batchId?: string) => void;
    updatePrice: (id: string, price: string, batchId?: string) => void;
    removeFromCart: (id: string, batchId?: string) => void;
}

export default function CartItemRow({
    item,
    updateQty,
    updatePrice,
    removeFromCart,
}: Props) {
    return (
        <div className="flex flex-col gap-3 p-4 bg-white md:grid md:grid-cols-12 md:items-center md:gap-4 md:px-6 md:py-3 hover:bg-gray-50/50 border border-gray-300 rounded-xl">

            {/* Product */}
            <div className="flex justify-between items-start md:col-span-3">
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-gray-900 text-[15px] md:text-sm truncate">
                        {item.productName}
                    </span>

                    {item.batchLabel && (
                        <span className="text-[10px] md:text-[9px] bg-primary-50 text-primary-600 font-black px-1.5 py-0.5 rounded border border-primary-100 mt-1">
                            {item.batchLabel}
                        </span>
                    )}
                </div>

                {/* Mobile remove */}
                <button
                    onClick={() => removeFromCart(item.id, item.batchId ?? undefined)}
                    className="md:hidden text-gray-400 hover:text-rose-500 p-1"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Mobile meta */}
            <div className="md:hidden grid grid-cols-3 gap-2 py-2 border-y border-gray-50 bg-gray-50/50 px-2.5 rounded-xl text-[10px]">
                <Meta label="Cost" value={`Rs. ${item.cost.toLocaleString()}`} />
                <Meta label="Orig." value={item.originalPrice ? `Rs. ${item.originalPrice.toLocaleString()}` : '-'} />
                <Meta label="Catalog" value={item.catalogPrice ? `Rs. ${item.catalogPrice.toLocaleString()}` : '-'} />
            </div>

            {/* Desktop meta */}
            <div className="hidden md:block md:col-span-1 text-right text-[11px] text-gray-400 font-bold">
                Rs. {item.cost.toLocaleString()}
            </div>

            <div className="hidden md:block md:col-span-1 text-right text-[11px] text-gray-400 font-bold">
                {item.originalPrice ? `Rs. ${item.originalPrice.toLocaleString()}` : '-'}
            </div>

            <div className="hidden md:block md:col-span-1 text-right text-[11px] text-primary-500 font-bold">
                {item.catalogPrice ? `Rs. ${item.catalogPrice.toLocaleString()}` : '-'}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-6 md:grid md:grid-cols-6">

                {/* Price */}
                <div className="w-[120px] md:col-span-2 md:w-auto">
                    <label className="md:hidden text-[9px] text-gray-400 font-black uppercase mb-1 block">
                        Manual Price
                    </label>

                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs.</span>
                        <input
                            type="number"
                            value={item.price || ""}
                            onChange={(e) =>
                                updatePrice(item.id, e.target.value, item.batchId ?? undefined)
                            }
                            className={`w-full text-right border rounded-xl md:rounded-lg pl-8 pr-2 py-2 font-bold ${parseFloat(item.price || "0") <= item.cost
                                ? "border-rose-500 text-rose-600 bg-rose-50"
                                : "border-gray-200"
                                }`}
                        />
                    </div>
                </div>

                {/* Qty */}
                <div className="md:col-span-2 flex flex-col md:items-center">
                    <label className="md:hidden text-[9px] text-gray-400 font-black uppercase mb-1">
                        Quantity
                    </label>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => updateQty(item.id, Math.max(1, item.qty - 1), item.batchId ?? undefined)}
                            className="btn-qty"
                        >
                            <Minus size={14} />
                        </button>

                        <input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                                updateQty(item.id, Number(e.target.value), item.batchId ?? undefined)
                            }
                            className="w-12 text-center font-black text-primary-600 bg-transparent"
                        />

                        <button
                            onClick={() => updateQty(item.id, item.qty + 1, item.batchId ?? undefined)}
                            className="btn-qty"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                {/* Total */}
                <div className="md:col-span-1 text-right">
                    <span className="font-black text-gray-900">
                        Rs. {(Number(item.price || 0) * item.qty).toLocaleString()}
                    </span>
                </div>

                {/* Desktop remove */}
                <div className="hidden md:flex md:col-span-1 justify-end">
                    <button
                        onClick={() => removeFromCart(item.id, item.batchId ?? undefined)}
                        className="text-gray-300 hover:text-rose-500"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* Small reusable sub component */
function Meta({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-gray-400 text-[8px] font-black uppercase">{label}</span>
            <span className="font-bold text-gray-600">{value}</span>
        </div>
    );
}