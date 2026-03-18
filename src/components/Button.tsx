import React from "react";

type ButtonVariant = "primary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500/50",
    danger:
      "bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:via-rose-600 hover:to-pink-600 focus:ring-red-400",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      )}

      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;