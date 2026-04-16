"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CreditCard, Search, Calendar, ChevronRight, X, Package, User, History, CheckCircle2, Trash2 } from "lucide-react";
import ReceiptPrint from "@/src/components/ReceiptPrint";
import { Sale } from "@/src/types/sale";
import { useSales } from "@/src/context/SalesContext";
import GenericTable from "@/src/components/GenericTable";
import Button from "@/src/components/Button";

const formatDateTime = (isoString?: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
};


const CloseButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="p-2 transition-all hover:bg-gray-100 rounded-xl group"
    >
        <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900 group-hover:rotate-90 transition-all duration-300" />
    </button>
);

export default function OrdersPage() {
    const { sales, loading, loadSales, addPayment, deleteSale } = useSales();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [agingFilter, setAgingFilter] = useState<string>("all");

    useEffect(() => { console.log(sales) }, [sales])

    const totalDue = sales.reduce((sum, order) => {
        return sum + (order.balanceAmount || 0);
    }, 0);

    const totalProfit = sales
        .filter(sale => sale.status === "completed")
        .reduce((orderSum, order) => {
            const orderProfit = order.items.reduce((itemSum, item) => {
                return itemSum + ((parseFloat(item.price) - item.cost) * item.qty);
            }, 0);

            return orderSum + orderProfit;
        }, 0);

    const fetchSales = useCallback(async () => {
        try {
            await loadSales();
        } catch (error) {
            console.error("Error loading sales:", error);
            alert("Failed to load sales history.");
        }
    }, [loadSales]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const handleAddPayment = async () => {
        if (!selectedSale || !selectedSale.id) return;
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (amount > (selectedSale.balanceAmount || 0)) {
            alert("Payment amount cannot exceed the pending balance.");
            return;
        }

        setIsProcessingPayment(true);
        try {
            const updated = await addPayment(selectedSale.id, amount);
            setSelectedSale(updated);
            setPaymentAmount("");
        } catch (error: any) {
            console.error("Error adding payment:", error);
            alert(error.message || "Failed to add payment.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleDeleteSale = async () => {
        if (!selectedSale || !selectedSale.id) return;

        const confirmMessage = selectedSale.status === 'draft' || selectedSale.status === 'quotation'
            ? "Are you sure you want to delete this record?"
            : "Are you sure you want to delete this order? This will restore the items back to inventory.";

        if (!confirm(confirmMessage)) return;

        try {
            await deleteSale(selectedSale.id);
            setSelectedSale(null);
        } catch (error: any) {
            console.error("Error deleting sale:", error);
            alert(error.message || "Failed to delete order.");
        }
    };

    const agingStats = useMemo(() => {
        const now = new Date();
        const stats = {
            fourteenToTwentyOne: { count: 0, totalBalance: 0 },
            overTwentyOne: { count: 0, totalBalance: 0 },
        };

        sales.forEach(sale => {
            if (sale.status === 'pending-payment' && sale.createdAt) {
                const createdDate = new Date(sale.createdAt);
                const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                const balance = sale.balanceAmount || 0;

                if (diffDays >= 21) {
                    stats.overTwentyOne.count++;
                    stats.overTwentyOne.totalBalance += balance;
                } else if (diffDays >= 14) {
                    stats.fourteenToTwentyOne.count++;
                    stats.fourteenToTwentyOne.totalBalance += balance;
                }
            }
        });

        return stats;
    }, [sales]);

    const filteredSales = useMemo(() => {
        const sortedSales = [...sales].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });
        const term = searchTerm.toLowerCase().trim();
        const now = new Date();

        return sortedSales.filter(sale => {
            const matchesSearch = !term ||
                sale.buyerName.toLowerCase().includes(term) ||
                sale.id?.toLowerCase().includes(term) ||
                sale.items.some(item => item.productName.toLowerCase().includes(term));

            const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;

            let matchesAging = true;
            if (agingFilter !== 'all' && sale.status === 'pending-payment' && sale.createdAt) {
                const createdDate = new Date(sale.createdAt);
                const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                if (agingFilter === '14-21') {
                    matchesAging = diffDays >= 14 && diffDays < 21;
                } else if (agingFilter === '21+') {
                    matchesAging = diffDays >= 21;
                }
            } else if (agingFilter !== 'all') {
                matchesAging = false;
            }

            return matchesSearch && matchesStatus && matchesAging;
        });
    }, [searchTerm, statusFilter, agingFilter, sales]);

    const columns = useMemo(() => [
        {
            header: "Receipt ID",
            accessor: (sale: Sale) => (
                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {sale.id?.slice(-8).toUpperCase() || "NEW"}
                </span>
            ),
        },
        {
            header: "Date",
            accessor: (sale: Sale) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="opacity-40" />
                    <span className="text-sm font-medium">{formatDateTime(sale.createdAt)}</span>
                </div>
            )
        },
        {
            header: "Buyer Name",
            accessor: (sale: Sale) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{sale.buyerName}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        {sale.status === 'completed' && (
                            <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full border border-primary-100 font-bold uppercase tracking-wider">
                                Paid
                            </span>
                        )}
                        {sale.status === 'pending-payment' && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 font-bold uppercase tracking-wider">
                                {sale.paidAmount && sale.paidAmount > 0 ? 'Part Paid' : 'Credit / Unpaid'}
                            </span>
                        )}
                        {sale.status === 'quotation' && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-bold uppercase tracking-wider">
                                Quotation
                            </span>
                        )}
                        {sale.status === 'draft' && (
                            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200 font-bold uppercase tracking-wider">
                                Draft
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        // {
        //     header: "Items",
        //     accessor: (sale: Sale) => (
        //         <div className="flex flex-col gap-1">
        //             <span className="text-sm font-semibold text-gray-700">
        //                 {sale.items.length} product(s)
        //             </span>
        //             <div className="flex gap-1 flex-wrap">
        //                 {sale.items.slice(0, 2).map((item, i) => (
        //                     <span key={i} className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-md border border-primary-100">
        //                         {item.qty}x {item.productName} {item.batchLabel ? `(${item.batchLabel})` : ''}
        //                     </span>
        //                 ))}
        //                 {sale.items.length > 2 && (
        //                     <span className="text-[10px] text-gray-400">+{sale.items.length - 2} more</span>
        //                 )}
        //             </div>
        //         </div>
        //     )
        // },
        {
            header: "Payment Overview",
            accessor: (sale: Sale) => (
                <div className="flex flex-col text-right">
                    <span className="font-black text-gray-900 text-sm">
                        Rs. {sale.total.toLocaleString()}
                    </span>
                    {sale.status !== 'quotation' && (
                        <div className="flex flex-col gap-0.5 mt-1">
                            {(sale.paidAmount ?? 0) > 0 && (
                                <span className="text-[10px] text-emerald-600 font-bold">
                                    Recv: Rs. {(sale.paidAmount ?? 0).toLocaleString()}
                                </span>
                            )}
                            {(sale.balanceAmount || 0) > 0 && (
                                <span className="text-[10px] text-amber-600 font-bold italic">
                                    Due: Rs. {sale.balanceAmount?.toLocaleString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ),
            className: "text-right"
        },
        {
            header: "Action",
            accessor: (sale: Sale) => (
                <div className="flex justify-end">
                    <button
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all group"
                        onClick={() => setSelectedSale(sale)}
                    >
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )
        }
    ], []);

    useEffect(() => {
        console.log("=== SALES DEBUG ===");
        sales.forEach(s => {
            console.log({
                id: s.id,
                status: s.status,
                paidAmount: s.paidAmount
            });
        });
    }, [sales]);

    const totalRevenue = useMemo(() =>
        sales
            .filter(s => s.status !== 'quotation')
            .reduce((acc, curr) => Number(acc) + (Number(curr.paidAmount) || 0), 0),
        [sales]);

    const totalQuotations = useMemo(() =>
        sales.filter(s => s.status === 'quotation').reduce((acc, curr) => acc + curr.total, 0)
        , [sales]);

    return (
        <div className="relative">
            {/* Screen-only UI */}
            <div className="no-print p-6 max-w-7xl mx-auto min-h-[60vh]">
                <header className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Sales History</h1>
                        <p className="text-[10px] text-gray-500 mt-0.5">Review and manage past transactions</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Status Filter */}
                        <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                            {[
                                { label: "All", value: "all" },
                                { label: "Paid", value: "completed" },
                                { label: "Unpaid", value: "pending-payment" },
                                { label: "Draft", value: "draft" },
                                { label: "Offer", value: "quotation" }
                            ].map((btn) => (
                                <button
                                    key={btn.value}
                                    onClick={() => setStatusFilter(btn.value)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === btn.value
                                        ? "bg-white text-primary-600 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>


                <GenericTable<Sale>
                    data={filteredSales}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage="No sales recorded yet. Head over to the Checkout page to start selling!"
                    rowKey={(sale) => sale.id || `pending-${Math.random()}`}
                    pageSize={10}
                />

                <footer className="mt-8 bg-primary-900 text-white p-4 md:p-6 rounded-2xl shadow-xl shadow-primary-200/50">

                    {/* Top Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-4 lg:gap-10">

                        <div>
                            <p className="text-primary-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                                Total Received
                            </p>
                            <p className="text-lg md:text-xl font-black">
                                Rs. {totalRevenue.toLocaleString()}
                            </p>
                        </div>

                        <div className="sm:border-l sm:pl-6 border-primary-800/50">
                            <p className="text-primary-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                                Total Due
                            </p>
                            <p className="text-lg md:text-xl font-black text-primary-400">
                                Rs. {totalDue.toLocaleString()}
                            </p>
                        </div>

                        <div className="sm:border-l sm:pl-6 border-primary-800/50">
                            <p className="text-primary-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                                Total Profit
                            </p>
                            <p className="text-lg md:text-xl font-black text-primary-400">
                                Rs. {totalProfit.toLocaleString()}
                            </p>
                        </div>

                    </div>

                    {/* Aging Buttons */}
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">

                        <button
                            onClick={() => {
                                setAgingFilter(agingFilter === '14-21' ? 'all' : '14-21');
                                setStatusFilter('all');
                            }}
                            className={`w-full sm:w-auto flex flex-col items-start p-3 rounded-xl border transition-all ${agingFilter === '14-21'
                                ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                                : 'bg-primary-800/30 border-primary-800/50 text-primary-300'
                                }`}
                        >
                            <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                                14-21 Days Late
                            </span>
                            <p className="text-sm font-black">
                                Rs. {agingStats.fourteenToTwentyOne.totalBalance.toLocaleString()}
                            </p>
                        </button>

                        <button
                            onClick={() => {
                                setAgingFilter(agingFilter === '21+' ? 'all' : '21+');
                                setStatusFilter('all');
                            }}
                            className={`w-full sm:w-auto flex flex-col items-start p-3 rounded-xl border transition-all ${agingFilter === '21+'
                                ? 'bg-rose-400/20 border-rose-400 text-rose-400'
                                : 'bg-primary-800/30 border-primary-800/50 text-primary-300'
                                }`}
                        >
                            <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                                21+ Days Late
                            </span>
                            <p className="text-sm font-black">
                                Rs. {agingStats.overTwentyOne.totalBalance.toLocaleString()}
                            </p>
                        </button>

                    </div>

                    {/* Bottom Right */}
                    <div className="mt-4 pt-4 border-t border-primary-800/50 text-center sm:text-right">
                        <p className="text-primary-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                            Total Records
                        </p>
                        <p className="text-lg md:text-xl font-black">{sales.length}</p>
                    </div>

                </footer>

                {/* Sale Details Modal */}
                {selectedSale && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                            onClick={() => setSelectedSale(null)}
                        ></div>

                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-200 overflow-y-auto">
                            <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <CreditCard className="text-primary-600" size={20} />
                                        Order Details
                                    </h2>
                                    <p className="text-[10px] text-mono text-gray-400 mt-0.5 uppercase tracking-tighter">
                                        ID: #{selectedSale.id?.toUpperCase()} • {formatDateTime(selectedSale.createdAt)}
                                    </p>
                                </div>
                                <CloseButton onClick={() => setSelectedSale(null)} />
                            </header>

                            <div className="p-6 space-y-6">
                                {/* Customer Info */}
                                <section className="bg-primary-50/50 p-5 rounded-xl border border-primary-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-primary-100 flex items-center justify-center text-primary-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-primary-500 font-bold uppercase tracking-wider mb-0.5">Customer / Buyer</p>
                                            <p className="text-base font-black text-primary-900">{selectedSale.buyerName}</p>
                                            {selectedSale.customerId && (
                                                <p className="text-[9px] text-primary-400 font-mono italic">Linked to CRM: {selectedSale.customerId.slice(-6)}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-primary-500 font-bold uppercase tracking-wider mb-0.5">Payment Status</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedSale.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            selectedSale.status === 'pending-payment' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                'bg-primary-100 text-primary-700 border-primary-200'
                                            }`}>
                                            {selectedSale.status === 'completed' ? 'Paid' : selectedSale.status === 'pending-payment' ? 'Unpaid' : selectedSale.status === 'draft' ? 'Draft' : 'Offer'}
                                        </span>
                                    </div>
                                </section>

                                {selectedSale.status === 'draft' && (
                                    <section className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-amber-800">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <History size={18} className="text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold">Draft Order</p>
                                                <p className="text-[10px] opacity-75">This order is not yet completed and hasn't affected inventory.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="!bg-rose-500 !text-white hover:!bg-rose-600 !rounded-xl !text-[10px] !font-black uppercase tracking-wider"
                                                onClick={handleDeleteSale}
                                            >
                                                Delete
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="!rounded-xl !text-[10px] !font-black uppercase tracking-wider"
                                                onClick={() => {
                                                    window.location.href = `/sales?resume=${selectedSale.id}`;
                                                }}
                                            >
                                                Resume Order
                                            </Button>
                                        </div>
                                    </section>
                                )}

                                {/* Items List */}
                                <section>
                                    <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Package size={14} className="text-gray-400" />
                                        Purchased Items
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedSale.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:bg-white transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-md border border-gray-200 flex items-center justify-center font-bold text-gray-400 group-hover:text-primary-600 group-hover:border-primary-200 transition-colors text-xs">
                                                        {item.qty}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-xs">
                                                            {item.productName}
                                                            {item.batchLabel && (
                                                                <span className="ml-2 text-[10px] text-primary-500 font-bold uppercase tracking-wider">
                                                                    Batch: {item.batchLabel}
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-[9px] text-gray-400 font-medium">Unit Price: Rs. {item.price.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right text-gray-900 font-black text-xs">
                                                    Rs. {(parseFloat(item.price) * item.qty).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Payment History & Add Payment */}
                                {selectedSale.status !== 'quotation' && (
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                                                <History size={14} className="text-gray-400" />
                                                Payment History
                                            </h3>
                                            {selectedSale.status === 'pending-payment' && (
                                                <span className="text-[10px] text-amber-600 font-black flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                                    Pending Rs. {selectedSale.balanceAmount?.toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        {/* Transaction list */}
                                        {selectedSale.paymentTransactions && selectedSale.paymentTransactions.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedSale.paymentTransactions.map((tx, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                                                <CheckCircle2 size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900">Payment Received</p>
                                                                <p className="text-[9px] text-gray-400">{formatDateTime(tx.paidAt)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black text-emerald-600">+ Rs. {tx.amount.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-gray-400 italic text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                                No payment transactions recorded yet.
                                            </p>
                                        )}

                                        {/* Add Payment Input */}
                                        {selectedSale.status === 'pending-payment' && (
                                            <div className="mt-4 p-4 bg-primary-50 border border-primary-100 rounded-2xl shadow-inner shadow-primary-900/5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">Record New Payment</label>
                                                    <p className="text-[9px] text-primary-400 italic">Max: Rs. {selectedSale.balanceAmount?.toLocaleString()}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rs.</span>
                                                        <input
                                                            type="number"
                                                            value={paymentAmount}
                                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full pl-9 pr-4 py-2 bg-white border border-primary-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-sm font-bold text-primary-900 shadow-sm"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="rounded-xl px-6 h-[42px]"
                                                        onClick={handleAddPayment}
                                                        isLoading={isProcessingPayment}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                )}

                                <div className="border-t border-dashed border-gray-200 pt-5 mt-5">
                                    <div className="flex justify-between items-center px-2">
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Final Total</p>
                                        <p className="text-2xl font-black text-primary-600">
                                            Rs. {selectedSale.total.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <footer className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4 no-print">
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="!bg-none !bg-transparent !text-rose-600 !border !border-rose-100 hover:!bg-rose-50 !rounded-xl !text-[10px] !font-black uppercase tracking-wider !shadow-none"
                                    onClick={handleDeleteSale}
                                >
                                    <Trash2 size={14} className="mr-2" />
                                    Delete Record
                                </Button>
                                <div className="flex gap-3 justify-end">
                                    <Button size="sm" onClick={() => window.print()} className="!rounded-xl !text-[10px] !font-black uppercase tracking-wider">
                                        Print Receipt
                                    </Button>
                                    <Button variant="primary" size="sm" onClick={() => setSelectedSale(null)} className="!rounded-xl !text-[10px] !font-black uppercase tracking-wider">
                                        Close
                                    </Button>
                                </div>
                            </footer>
                        </div>
                    </div>
                )}

                {/* Clean Loader (Within Content) */}
                {loading && (
                    <div className="absolute inset-0 z-[50] bg-gray-50/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
                                <CreditCard className="absolute inset-0 m-auto text-primary-600 w-6 h-6" />
                            </div>
                            <p className="font-black text-primary-900 uppercase tracking-[0.3em] text-[10px]">Fetching Records</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Print-only Component */}
            {selectedSale && (
                <div className="print-only">
                    <ReceiptPrint sale={selectedSale} />
                </div>
            )}
        </div>
    );
}
