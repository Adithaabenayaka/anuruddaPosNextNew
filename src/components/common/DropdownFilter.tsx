"use client";

import { useState, useRef, useEffect } from "react";
import { BiFilterAlt } from "react-icons/bi";
import { GoChevronDown } from "react-icons/go";

type Option = {
  label: string;
  value: string;
};

interface Props {
  options: Option[];
  value: string;
  isIconDown?: boolean;
  onChange: (value: string) => void;
}

export default function DropdownFilter({
  options,
  value,
  isIconDown,
  onChange,
}: Props) {
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
    <div
      className="relative h-[44px] border font-plus-sans border-[#AFAFAF] hover:border-[#3A8B13] rounded-md cursor-pointer text-[14px]"
      ref={dropdownRef}
    >
      {/* Button */}
      <div
        className="flex gap-x-[8px] px-[16px] py-[12px] w-[96px] midlg:w-auto xlg:w-[124px] xl:w-auto dark:bg-gray-900 dark:text-white text-[#4A4A4A] text-nowrap"
        onClick={() => setOpen(!open)}
      >
        {isIconDown ? (
          <>
            <span className="truncate whitespace-nowrap">{selected.label}</span>
            <GoChevronDown className="min-w-[20px] min-h-[20px] text-[#4A4A4A] dark:text-white" />
          </>
        ) : (
          <>
            <BiFilterAlt className="min-w-[20px] min-h-[20px] text-[#4A4A4A] dark:text-white" />
            <span className="truncate whitespace-nowrap">{selected.label}</span>
          </>
        )}
      </div>

      {/* Dropdown List */}
      {open && (
        <div className="absolute z-10 mt-[8px] right-0 rounded-[8px] w-[160px] bg-white dark:bg-gray-900 shadow-[0px_0px_9.24px_0px_#0000008C] ">
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
