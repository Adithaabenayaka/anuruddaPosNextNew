"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import TextArea from "../form/input/TextArea";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  variant?: "confirm" | "approval";
  confirmText?: string;
  cancelText?: string;
  iconSrc?: string;
  reason: string;
  placeholderText: string;

  reasonValue: string;
  onReasonChange: (value: string) => void;

  onConfirm: () => void;
  onCancel: () => void;
};

export default function ReasonDialog({
  open,
  title,
  message,
  variant,
  confirmText = "Yes",
  cancelText = "No",
  iconSrc = "/images/application/success.webp",
  reason,
  reasonValue,
  onReasonChange,
  placeholderText,
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (top) {
        window.scrollTo(0, parseInt(top || "0") * -1);
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="h-full bg-black/90 backdrop-blur-xs font-plus-sans fixed inset-0 z-[1000] flex items-center justify-center px-6">
      <div className="w-full py-[30px] px-6 flex flex-col gap-y-[32px] justify-center bg-white rounded-[0.5rem] max-w-[604px] lg:max-w-[760px]">
        {iconSrc && (
          <div className="lg:w-10 xl:w-auto mx-auto">
            <Image
              width={67}
              height={67}
              src={iconSrc}
              alt="Dialog Icon"
              className="aspect-square"
            />
          </div>
        )}

        {variant === "confirm" && (
          <>
            <div>
              <h1 className="text-[#1A1A1A] text-[20px] leading-[24px] font-bold text-center">
                {title}
              </h1>
              {message && (
                <p className="text-[#1A1A1A] text-center text-base leading-[24px]">
                  {message}
                </p>
              )}
            </div>
            {/* <div>Please provide a reason for the rejection before proceeding.</div> */}
            <div className="flex flex-col gap-[8px]">
              <div className="text-[14px] leading-[20px] text-[#1A1A1A]">
                {reason} Reason
              </div>
              <TextArea
                value={reasonValue}
                placeholder={placeholderText}
                onChange={onReasonChange}
                rows={4}
                className="h-[112px] resize-none"
              />
            </div>

            <div className="flex flex-row-reverse gap-6">
              <button
                disabled={!reasonValue.trim()}
                className={`${
                  !reasonValue.trim()
                    ? "bg-[#C9EDB8] text-[#8BD766] cursor-not-allowed"
                    : "bg-[#3A8B13] hover:bg-[#1A1A1A] text-white"
                } duration-300 text-[14px] rounded-[0.5rem] h-[44px] min-w-[120px]`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>

              <button
                onClick={onCancel}
                className="bg-white hover:border-[#1A1A1A] duration-300 text-[14px] text-[#1A1A1A] rounded-[0.5rem] h-[44px] min-w-[120px] border border-[#2D6C0F]"
              >
                {cancelText}
              </button>
            </div>
          </>
        )}

        {variant === "approval" && (
          <div>
            <h1 className="text-[#1A1A1A] text-[1.125rem] lg:text-[1.25rem] font-bold text-center">
              {title}
            </h1>
            {message && (
              <p className="text-[#666] text-center mt-2">{message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
