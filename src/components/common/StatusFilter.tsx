"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";

type Option = {
  label: string;
  value: string;
};

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function DropdownFilter({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        className="flex items-center p-4 h-11 rounded-lg border border-gray-400 gap-2 w-full md:w-auto justify-center"
        onClick={() => setOpen(!open)}
      >
        <Icon name="Filter" className="text-black" />
        <p className="text-nowrap">{selected.label}</p>
      </button>

      {/* Dropdown List */}
      {open && (
        <div className="absolute right-0 w-[160px] z-10 mt-[8px] rounded-[8px] bg-white dark:bg-gray-900 shadow-[0px_0px_9.24px_0px_#0000008C] ">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-[14px] py-[8px] text-[14px] rounded-[8px] dark:hover:bg-gray-700 ${
                value === opt.value
                  ? "bg-[#3A8B13] text-white font-medium hover:bg-[#2D6C0F]"
                  : "text-[#4A4A4A] dark:text-white hover:bg-[#EEF9E8]"
              } ${opt.value === "all" ? "hidden" : "cursor-pointer"}`}
              onClick={() => {
                if (opt.value === "all") return;
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
