"use client";

import React, { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input: React.FC<InputProps> = ({
  className = "",
  error,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full">
        {/* LEFT ICON */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {leftIcon}
          </div>
        )}

        {/* INPUT */}
        <input
          {...props}
          className={`
            w-full h-[48px] 
            ${leftIcon ? "pl-10" : "pl-3"}
            ${rightIcon ? "pr-10" : "pr-3"}
            bg-white 
            border rounded-lg
            text-sm
            outline-none
            transition-all
            cursor-text
          `}
          style={{
            borderColor: "#e5e7eb",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: "14px",
            color: "#1A1A1A",
            boxShadow: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(170, 154, 136, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        {/* RIGHT ICON */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer">
            {rightIcon}
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;