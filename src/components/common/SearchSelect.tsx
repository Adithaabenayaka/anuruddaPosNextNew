"use client";

import React, { useEffect, useRef } from "react";

interface Customer {
  id: string;
  customerName: string;
  phone?: string;
  loyaltyPoints?: number;
}

interface CustomerSearchSelectProps {
  value: string;
  customers: Customer[];
  showResults: boolean;
  onChange: (text: string) => void;
  onSelect: (customer: Customer) => void;
  onFocus: () => void;
  onResetSelected: () => void;
  className?: string;
}

const CustomerSearchSelect: React.FC<CustomerSearchSelectProps> = ({
  value,
  customers,
  showResults,
  onChange,
  onSelect,
  onFocus,
  onResetSelected,
  className = "",
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        onFocus && onFocus(); // optional: or you can pass a close handler
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onFocus]);

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      {/* INPUT */}
      <input
        type="text"
        placeholder="Search customer or enter guest name..."
        className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-sm font-semibold font-plus-sans"
        value={value}
        onChange={(e) => {
          const text = e.target.value;
          onChange(text);
          onResetSelected(); // reset selected ID
        }}
        onFocus={onFocus}
      />

      {/* DROPDOWN */}
      {showResults && customers.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden p-1">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="p-3 hover:bg-primary-50 rounded-lg cursor-pointer transition-colors border-b border-gray-50 last:border-0"
              onClick={() => onSelect(customer)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-gray-900">
                    {customer.customerName}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono italic">
                    {customer.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-primary-500 font-black uppercase tracking-widest">
                    {customer.loyaltyPoints || 0} PTS
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerSearchSelect;