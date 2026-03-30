"use client";

import React, { ReactElement } from "react";
import { cn } from "@/lib/utils";
import Icon, { IconName } from "@/components/common/Icon";
import DialogModal from "@/components/ui/dialog/DialogModal";

interface IconMessageDialogProps {
  open: boolean;
  title: string;
  message?: string;
  children?: ReactElement;
  iconSrc?: IconName;
  onCancel: () => void;
  IconSuccess: boolean;
}

export default function IconMessageDialog({
  open,
  title,
  message,
  iconSrc = "SuccessOutlined",
  onCancel,
  children,
  IconSuccess,
}: Readonly<IconMessageDialogProps>) {
  return (
    <DialogModal isOpen={open} onClose={onCancel}>
      <div
        className={`flex flex-col min-h-[332px] p-[30px] gap-8 text-black justify-center items-center w-full`}
      >
        <div className="flex flex-col justify-center items-center w-full gap-8">
          {iconSrc && (
            <div
              className={cn(
                "flex p-2 h-[67px] w-[67px] rounded-full justify-center items-center ",
                IconSuccess ? "bg-success-50" : "bg-danger-50",
              )}
            >
              <Icon
                name={iconSrc}
                className={cn(
                  "w-[45px] h-[45px]",
                  IconSuccess ? "text-success-500" : "text-danger-500",
                )}
              />
            </div>
          )}
          {title && (
            <div className="flex flex-col text-black">
              <h1 className={`sm:heading-5-bold! title-1-bold`}>{title}</h1>
              {message && (
                <p className="md:body-1-regular body-2-regular">{message}</p>
              )}
            </div>
          )}
        </div>
        <div
          className={cn("flex flex-col w-full", children ? "flex" : "hidden")}
        >
          {children}
        </div>
      </div>
    </DialogModal>
  );
}
