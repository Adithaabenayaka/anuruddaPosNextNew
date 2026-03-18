import React from "react";

interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

const CloseButton: React.FC<CloseButtonProps> = ({
  size = "md",
  className = "",
  ...props
}) => {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
  };

  return (
    <button
      className={`
        group relative overflow-hidden rounded-full
        flex items-center justify-center
        active:scale-95 transition-all 
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="gray"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 6l12 12M6 18L18 6"
        />
      </svg>
    </button>
  );
};

export default CloseButton;
