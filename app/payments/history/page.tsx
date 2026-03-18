"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Search } from "lucide-react";
import GenericTable from "@/src/components/GenericTable";
import { useSales } from "@/src/context/SalesContext";
import { PaymentTransaction, Sale } from "@/src/types/sale";

type PaymentHistoryRow = {
  rowId: string;
  saleId: string;
  buyerName: string;
  saleTotal: number;
  saleStatus: Sale["status"];
  paymentAmount: number;
  paymentDate: string;
  balanceAfter?: number;
};

const formatDate = (isoString?: string) => {
  if (!isoString) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
};

export default function PaymentHistoryPage() {
  const { sales, loading, loadSales } = useSales();
  const [paymentRows, setPaymentRows] = useState<PaymentHistoryRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPaymentHistory = useCallback(async () => {
    try {
      await loadSales();
      const rows = sales.flatMap((sale) => {
        const transactions = sale.paymentTransactions || [];

        if (transactions.length > 0) {
          return transactions.map((tx: PaymentTransaction) => ({
            rowId: `${sale.id || "sale"}-${tx.id}`,
            saleId: sale.id || "NEW",
            buyerName: sale.buyerName,
            saleTotal: sale.total,
            saleStatus: sale.status,
            paymentAmount: tx.amount,
            paymentDate: tx.paidAt,
            balanceAfter: tx.balanceAmountAfter,
          }));
        }

        if ((sale.paidAmount || 0) > 0) {
          return [
            {
              rowId: `${sale.id || "sale"}-legacy`,
              saleId: sale.id || "NEW",
              buyerName: sale.buyerName,
              saleTotal: sale.total,
              saleStatus: sale.status,
              paymentAmount: sale.paidAmount || 0,
              paymentDate: sale.createdAt || sale.updatedAt || new Date().toISOString(),
              balanceAfter: sale.balanceAmount,
            },
          ];
        }

        return [];
      });

      const sortedRows = rows.sort((a, b) => {
        const dateA = new Date(a.paymentDate).getTime();
        const dateB = new Date(b.paymentDate).getTime();
        return dateB - dateA;
      });

      setPaymentRows(sortedRows);
    } catch (error) {
      console.error("Error loading payment history:", error);
      alert("Failed to load payment history.");
    }
  }, [loadSales, sales]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return paymentRows;

    return paymentRows.filter((row) => {
      return (
        row.buyerName.toLowerCase().includes(term) ||
        row.saleId.toLowerCase().includes(term)
      );
    });
  }, [paymentRows, searchTerm]);

  const totalCollected = useMemo(
    () => filteredRows.reduce((acc, row) => acc + row.paymentAmount, 0),
    [filteredRows]
  );

  const columns = useMemo(
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
        header: "Order Total",
        accessor: (row: PaymentHistoryRow) => (
          <span className="font-bold text-gray-700">Rs. {row.saleTotal.toLocaleString()}</span>
        ),
        className: "text-right",
      },
      {
        header: "Payment Amount",
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
            className={`text-[10px] px-2 py-1 rounded-full border font-bold uppercase tracking-wider ${row.saleStatus === "completed"
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
          <Link
            href="/payments"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary mb-2"
          >
            <ArrowLeft size={14} />
            Back to Payments
          </Link>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Payment History</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Review all received payments and partial collections</p>
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

      <GenericTable<PaymentHistoryRow>
        data={filteredRows}
        columns={columns}
        isLoading={loading}
        emptyMessage="No payment history available yet."
        rowKey={(row) => row.rowId}
        pageSize={10}
      />

      <footer className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Payment Records</p>
          <p className="text-lg font-black text-emerald-900">{filteredRows.length}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Total Collected</p>
          <p className="text-lg font-black text-emerald-900">Rs. {totalCollected.toLocaleString()}</p>
        </div>
      </footer>
    </div>
  );
}
