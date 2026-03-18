"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Search, X } from "lucide-react";
import GenericTable from "@/src/components/GenericTable";
import { useSales } from "@/src/context/SalesContext";
import { PaymentTransaction, Sale } from "@/src/types/sale";
import Button from "@/src/components/Button";

type PaymentHistoryRow = {
  rowId: string;
  saleId: string;
  buyerName: string;
  paymentAmount: number;
  paymentDate: string;
  balanceAfter?: number;
  saleStatus: Sale["status"];
};

type PaymentsSettlementAndHistoryProps = {
  title: string;
  subtitle: string;
  showBackLink?: boolean;
};

const formatDate = (isoString?: string) => {
  if (!isoString) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
};

export default function PaymentsSettlementAndHistory({
  title,
  subtitle,
  showBackLink = false,
}: PaymentsSettlementAndHistoryProps) {
  const { sales: allSales, loading, loadSales, addPayment } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchPendingSales = useCallback(async () => {
    try {
      await loadSales();
    } catch (error) {
      console.error("Error loading pending settlements:", error);
      alert("Failed to load pending settlements.");
    }
  }, [loadSales]);

  useEffect(() => {
    fetchPendingSales();
  }, [fetchPendingSales]);

  const filteredSales = useMemo(() => {
    const pendingSales = allSales
      .filter((sale) => sale.status === "pending-payment" && (sale.balanceAmount || 0) > 0)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

    const term = searchTerm.toLowerCase().trim();
    if (!term) return pendingSales;

    return pendingSales.filter((sale) => {
      return sale.buyerName.toLowerCase().includes(term) || sale.id?.toLowerCase().includes(term);
    });
  }, [allSales, searchTerm]);

  const totalPendingAmount = useMemo(
    () => filteredSales.reduce((acc, sale) => acc + (sale.balanceAmount || 0), 0),
    [filteredSales]
  );

  const paymentHistoryRows = useMemo<PaymentHistoryRow[]>(() => {
    const rows = allSales.flatMap((sale) => {
      const transactions = sale.paymentTransactions || [];

      if (transactions.length > 0) {
        return transactions.map((tx: PaymentTransaction) => ({
          rowId: `${sale.id || "sale"}-${tx.id}`,
          saleId: sale.id || "NEW",
          buyerName: sale.buyerName,
          paymentAmount: tx.amount,
          paymentDate: tx.paidAt,
          balanceAfter: tx.balanceAmountAfter,
          saleStatus: sale.status,
        }));
      }

      if ((sale.paidAmount || 0) > 0) {
        return [
          {
            rowId: `${sale.id || "sale"}-legacy`,
            saleId: sale.id || "NEW",
            buyerName: sale.buyerName,
            paymentAmount: sale.paidAmount || 0,
            paymentDate: sale.createdAt || sale.updatedAt || new Date().toISOString(),
            balanceAfter: sale.balanceAmount,
            saleStatus: sale.status,
          },
        ];
      }

      return [];
    });

    const term = searchTerm.toLowerCase().trim();
    const filteredRows = !term
      ? rows
      : rows.filter(
          (row) =>
            row.buyerName.toLowerCase().includes(term) || row.saleId.toLowerCase().includes(term)
        );

    return filteredRows.sort((a, b) => {
      const dateA = new Date(a.paymentDate).getTime();
      const dateB = new Date(b.paymentDate).getTime();
      return dateB - dateA;
    });
  }, [allSales, searchTerm]);

  const totalHistoryCollected = useMemo(
    () => paymentHistoryRows.reduce((acc, row) => acc + row.paymentAmount, 0),
    [paymentHistoryRows]
  );

  const resetPaymentModal = () => {
    setSelectedSale(null);
    setPaymentAmount("");
    setIsSubmittingPayment(false);
  };

  const handleOpenPaymentModal = (sale: Sale) => {
    setSelectedSale(sale);
    setPaymentAmount("");
  };

  const handleSubmitPayment = async () => {
    if (!selectedSale?.id) {
      alert("Invalid sale record.");
      return;
    }

    const parsedAmount = Number(paymentAmount);
    const currentBalance = selectedSale.balanceAmount || 0;

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      alert("Enter a valid payment amount greater than zero.");
      return;
    }

    if (parsedAmount > currentBalance) {
      alert(`Payment cannot exceed pending balance (Rs. ${currentBalance.toLocaleString()}).`);
      return;
    }

    try {
      setIsSubmittingPayment(true);
      await addPayment(selectedSale.id, parsedAmount);
      await fetchPendingSales();
      resetPaymentModal();
    } catch (error) {
      console.error("Error adding payment:", error);
      alert(error instanceof Error ? error.message : "Failed to add payment.");
      setIsSubmittingPayment(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Receipt ID",
        accessor: (sale: Sale) => (
          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {sale.id?.slice(-8).toUpperCase() || "NEW"}
          </span>
        ),
      },
      {
        header: "Buyer",
        accessor: (sale: Sale) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{sale.buyerName}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
              Pending Payment
            </span>
          </div>
        ),
      },
      {
        header: "Date",
        accessor: (sale: Sale) => (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} className="opacity-40" />
            <span className="text-sm font-medium">{formatDate(sale.createdAt)}</span>
          </div>
        ),
      },
      {
        header: "Total",
        accessor: (sale: Sale) => (
          <span className="font-bold text-gray-700">Rs. {sale.total.toLocaleString()}</span>
        ),
        className: "text-right",
      },
      {
        header: "Paid",
        accessor: (sale: Sale) => (
          <span className="font-bold text-emerald-600">Rs. {(sale.paidAmount || 0).toLocaleString()}</span>
        ),
        className: "text-right",
      },
      {
        header: "Balance Due",
        accessor: (sale: Sale) => (
          <span className="font-black text-amber-600">Rs. {(sale.balanceAmount || 0).toLocaleString()}</span>
        ),
        className: "text-right",
      },
      {
        header: "Action",
        accessor: (sale: Sale) => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleOpenPaymentModal(sale)}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-primary-50 text-primary-700 border border-primary-100 rounded-lg hover:bg-primary-100 transition-all"
            >
              Add Payment
            </button>
          </div>
        ),
        className: "text-right",
      },
    ],
    []
  );

  const historyColumns = useMemo(
    () => [
      {
        header: "Receipt ID",
        accessor: (row: PaymentHistoryRow) => (
          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {row.saleId.slice(-8).toUpperCase() || "NEW"}
          </span>
        ),
      },
      {
        header: "Buyer",
        accessor: (row: PaymentHistoryRow) => (
          <span className="font-bold text-gray-900">{row.buyerName}</span>
        ),
      },
      {
        header: "Payment Date",
        accessor: (row: PaymentHistoryRow) => (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} className="opacity-40" />
            <span className="text-sm font-medium">{formatDate(row.paymentDate)}</span>
          </div>
        ),
      },
      {
        header: "Amount",
        accessor: (row: PaymentHistoryRow) => (
          <span className="font-black text-emerald-600">Rs. {row.paymentAmount.toLocaleString()}</span>
        ),
        className: "text-right",
      },
      {
        header: "Balance After",
        accessor: (row: PaymentHistoryRow) => (
          <span className="font-bold text-amber-700">Rs. {(row.balanceAfter ?? 0).toLocaleString()}</span>
        ),
        className: "text-right",
      },
      {
        header: "Order Status",
        accessor: (row: PaymentHistoryRow) => (
          <span
            className={`text-[10px] px-2 py-1 rounded-full border font-bold uppercase tracking-wider ${
              row.saleStatus === "completed"
                ? "bg-primary-50 text-primary-700 border-primary-100"
                : "bg-amber-50 text-amber-700 border-amber-100"
            }`}
          >
            {row.saleStatus === "completed" ? "Paid" : "Part Paid"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {showBackLink && (
            <Link
              href="/payments"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary mb-2"
            >
              <ArrowLeft size={14} />
              Back to Payments
            </Link>
          )}
          <h1 className="text-xl font-black text-gray-900 tracking-tight">{title}</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search by receipt or buyer..."
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <GenericTable<Sale>
        data={filteredSales}
        columns={columns}
        isLoading={loading}
        emptyMessage="No pending settlements found."
        rowKey={(sale) => sale.id || `pending-${sale.buyerName}-${sale.total}`}
      />

      <footer className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Pending Records</p>
          <p className="text-lg font-black text-amber-900">{filteredSales.length}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Total Due</p>
          <p className="text-lg font-black text-amber-900">Rs. {totalPendingAmount.toLocaleString()}</p>
        </div>
      </footer>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-base font-black text-gray-900 tracking-tight">Payment History</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Each payment is shown as a separate line</p>
        </div>

        <GenericTable<PaymentHistoryRow>
          data={paymentHistoryRows}
          columns={historyColumns}
          isLoading={loading}
          emptyMessage="No payment history available yet."
          rowKey={(row) => row.rowId}
        />

        <footer className="mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Payment Rows</p>
            <p className="text-lg font-black text-emerald-900">{paymentHistoryRows.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Total Collected</p>
            <p className="text-lg font-black text-emerald-900">Rs. {totalHistoryCollected.toLocaleString()}</p>
          </div>
        </footer>
      </section>

      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={isSubmittingPayment ? undefined : resetPaymentModal}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">Add Part Payment</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedSale.buyerName}</p>
              </div>
              <button
                type="button"
                onClick={resetPaymentModal}
                disabled={isSubmittingPayment}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Receipt</span>
                  <span className="font-mono text-gray-700">{selectedSale.id?.slice(-8).toUpperCase() || "NEW"}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-500">Pending Balance</span>
                  <span className="font-black text-amber-700">Rs. {(selectedSale.balanceAmount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Payment Amount (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-sm"
                  placeholder="Enter payment amount"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetPaymentModal}
                disabled={isSubmittingPayment}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <Button
                type="button"
                size="sm"
                isLoading={isSubmittingPayment}
                onClick={handleSubmitPayment}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
