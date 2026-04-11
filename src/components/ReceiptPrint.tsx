'use client'
import { useEffect } from "react";
import { Sale } from "../types/sale";
import { BankDetails } from "../types/bankDetails";
import { useBankDetails } from "../context/BankDetailsContext";

interface ReceiptPrintProps {
    sale: Sale;
}

const ReceiptPrint = ({ sale }: ReceiptPrintProps) => {
    const isQuotation = sale.status === "quotation";

    const { selectedBankDetail } = useBankDetails();
    const subtotal = sale.items.reduce(
        (acc, item) => acc + Number(item.originalPrice ?? item.price) * Number(item.qty),
        0
    );

    const totalDiscount = sale.items.reduce((acc, item) => {
        if (item.originalPrice && Number(item.originalPrice) > Number(item.price)) {
            return acc + (Number(item.originalPrice) - Number(item.price)) * Number(item.qty);
        }
        return acc;
    }, 0);

    const total = sale.total;

    const formatLKR = (num: number) =>
        `${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-CA"); // 2026-03-18
    useEffect(() => { console.log(sale) }, [sale])

    return (
        <div className="receipt-print-container bg-white text-black font-sans flex justify-center">
            {/* Paper wrapper */}
            <div
                className={`bg-white ${isQuotation ? "w-[850px] " : "w-[500px]"}`}
            >

                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">
                    <div className="flex items-start gap-3">
                        <img
                            src="/ApexLogo.png"
                            alt="Logo"
                            className="w-16 h-16 object-contain"
                        />

                        <div className="text-[10px] leading-tight">
                            <p className="font-semibold text-gray-800">APEX OFFICE SOLUTIONS</p>
                            <p>KOTALAWALA, BANDARAGAMA</p>
                            <p>PHONE 038 22 91 581</p>
                            <p>MOBILE 070 62 62 434</p>
                        </div>
                    </div>

                    <div className="text-[10px] flex text-right justify-end">
                        <p><span className="font-semibold"></span> {formatDate(sale.updatedAt || "")}</p>
                    </div>
                </div>


                {/* Title */}
                <div className="flex justify-between items-center mt-3 mb-4">
                    <h1 className="text-base font-semibold">{isQuotation ? "QUOTATION" : "INVOICE"}</h1>
                    {/* <p className="text-[10px] font-semibold">INVOICE NO: {sale.id}</p> */}
                </div>


                {/* Bill & Ship */}
                <div className="grid grid-cols-2 gap-10 text-[10px] mb-4">
                    <div className="w-32">
                        <p className="text-gray-500 font-semibold">BILL TO</p>
                        <p className="font-semibold mt-1">{sale.buyerName}</p>
                        <p className="font-semibold">1/79 Raigama, Bandaragama,sdfsdf</p>

                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-gray-500 font-semibold">PAYMENT</p>
                        <p className="mt-1">Due: Mar 17, 2026</p>
                        <p>CASH</p>
                    </div>
                </div>

                {/* Table */}
                <div className="text-[10px]">
                    <div className="grid grid-cols-6 border-b pb-1 font-semibold text-gray-600">
                        <div className="col-span-2">ITEM</div>
                        <div className="text-center">QTY</div>
                        <div className="text-right">MRP</div>
                        <div className="text-right">RATE</div>
                        <div className="text-right">AMOUNT</div>
                    </div>

                    {sale.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-6 py-2 border-b">

                            <div className="col-span-2 break-words">
                                {item.productName}
                            </div>

                            <div className="text-center">{item.qty}</div>

                            {/* MRP */}
                            <div className="text-right">
                                {item.originalPrice && Number(item.originalPrice) > Number(item.price) ? (
                                    <span className="text-gray-400">
                                        {formatLKR(Number(item.originalPrice))}
                                    </span>
                                ) : (
                                    formatLKR(Number(item.price))
                                )}
                            </div>

                            {/* RATE */}
                            <div className="text-right">
                                {formatLKR(Number(item.price))}
                            </div>

                            {/* AMOUNT */}
                            <div className="text-right">
                                {formatLKR(Number(item.price) * Number(item.qty))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-4 flex justify-end">
                    <div className="w-full max-w-[200px] text-[10px]">

                        <div className="flex justify-between py-0.5">
                            <span>Subtotal</span>
                            <span>{formatLKR(subtotal)}</span>
                        </div>

                        <div className="flex justify-between py-0.5">
                            <span>Discount</span>
                            <span>-{formatLKR(totalDiscount)}</span>
                        </div>

                        <div className="border-t mt-1 pt-1 flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatLKR(total)}</span>
                        </div>

                        <div className="flex justify-between py-0.5 text-gray-600">
                            <span>Paid</span>
                            <span>{formatLKR(sale.paidAmount ?? 0)}</span>
                        </div>

                        <div className="flex justify-between py-0.5 text-gray-600">
                            <span>Balance</span>
                            <span>{formatLKR(sale.balanceAmount ?? 0)}</span>
                        </div>

                        {totalDiscount > 0 && (
                            <p className="text-[10px] text-green-800 mt-2 text-right font-bold">
                                You saved {formatLKR(totalDiscount)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div className="mt-4 text-[10px]">
                    <p className="font-semibold text-gray-500">BANK DETAILS</p>
                    <p>{selectedBankDetail?.AccHolderName || ""}</p>
                    <p>{selectedBankDetail?.AccNo || ""}</p>
                    <p>{selectedBankDetail?.BankName + " - " + selectedBankDetail?.BranchName || ""}</p>

                    <p className="font-semibold text-gray-500 mt-2">TERMS</p>
                    <p>INVOICE REQUIRED FOR WARRANTY CLAIMS</p>
                </div>
            </div>
        </div>
    );
};

export default ReceiptPrint;