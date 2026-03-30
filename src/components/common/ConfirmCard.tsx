"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import MainTitle from "../dashboard/MainTitle";
import Image from "next/image";
import { formatKey, formatValue } from "@/utils/formatKeyUtils";

//eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConfirmCardProps<T extends Record<string, any>> = {
  preview: T | null;
  preferredOrder: string[];
  title: string;
  subtitle?: string;
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ConfirmCard<T extends Record<string, any>>({
  preview,
  preferredOrder,
  title,
  subtitle,
}: Readonly<ConfirmCardProps<T>>) {
  const router = useRouter();

  // Helper function to convert backend format (camelCase or lowercase) to title case
  const titleCase = useCallback((str: string): string => {
    if (!str) return "";

    //Do NOT modify emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(str)) return str;

    return (
      str
        // Insert space for camelCase
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        // Capitalize words INCLUDING inside parentheses
        .replace(/\b(\w)/g, (char) => char.toUpperCase())
    );
  }, []);

  if (!preview) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">No preview data found.</p>
        <div className="mt-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  const keys = preferredOrder.filter((k) => k in preview);

  //classname with and without subtitle
  const containerClassName = subtitle ? "ml-3" : "ml-3 mt-2";

  return (
    <div className="bg-white rounded-[8px] pl-[24px] pr-[24px] pt-[24px] pb-[12px] shadow-sm w-full divide-y divide-[#F3F3F3]">
      <div className="pb-[14px] flex items-start border-[#DADADA]">
        <button onClick={() => router.back()} aria-label="Go back">
          <Image
            alt="back icon"
            src="/icons/back-arrow.svg"
            className="text-[#1A1A1A] w-[11px] h-[22px] my-2"
            width={11}
            height={22}
          />
        </button>
        <div className={containerClassName}>
          <MainTitle title={title} />
          {subtitle && <p className="text-[14px] text-[#666]">{subtitle}</p>}
        </div>
      </div>

      {/* for document fields */}
      <div className="mt-[16px]">
        {keys.map((k) => {
          const val = preview[k];
          return (
            <div
              key={k}
              className="flex justify-between items-center py-[18px] border-b last:border-b-0 font-plus-sans"
            >
              <span className="text-sm text-slate-700">{formatKey(k)}</span>
              <div className="font-bold max-w-[50%] text-right break-words">
                {val === null || val === undefined || val === ""
                  ? "-"
                  : typeof val === "string"
                    ? titleCase(val as string)
                    : formatValue(val)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
