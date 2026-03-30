import React from "react";
import { HiOutlineCalendarDateRange } from "react-icons/hi2";

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  placeholderText?: string;
}

const CustomDateInput = React.forwardRef<
  HTMLInputElement,
  CustomDateInputProps
>(({ value, onClick, placeholderText }, ref) => (
  <div className="relative">
    <input
      aria-label="date"
      type="text"
      placeholder={placeholderText}
      value={value}
      onClick={onClick}
      readOnly
      ref={ref}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-22 focus:outline-none"
    />
    <HiOutlineCalendarDateRange
      size={18}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
    />
  </div>
));

CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
