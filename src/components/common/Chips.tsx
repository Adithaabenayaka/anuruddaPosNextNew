import React from "react";
import Image from "next/image";
import { CloseIcon } from "../../../public/icons";

interface ChipItem {
  key: string;
  value: string;
  label: string;
}

interface ChipsProps {
  items: ChipItem;
  onRemove?: (value: string) => void;
  className?: string;
}

const Chips: React.FC<ChipsProps> = ({ items, onRemove, className = "" }) => {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <div
        key={items.key}
        className="flex items-center justify-between border border-gray-600 bg-white rounded-lg text-sm text-gray-600 p-3 w-full"
      >
        <span className="truncate max-w-[140px]">{items.label}</span>

        <button
          onClick={() => onRemove(items.value)}
          className="w-5 h-5 flex items-center justify-center rounded-full border-1 border-gray-300 text-gray-300 hover:bg-gray-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Chips;
