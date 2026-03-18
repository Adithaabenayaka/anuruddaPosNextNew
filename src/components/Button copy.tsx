// import React from "react";

// type ButtonVariant = "primary" | "danger";
// type ButtonSize = "sm" | "md" | "lg";

// interface ButtonProps
//   extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: ButtonVariant;
//   size?: ButtonSize;
//   isLoading?: boolean;
//   leftIcon?: React.ReactNode;
//   rightIcon?: React.ReactNode;
// }

// const Button: React.FC<ButtonProps> = ({
//   children,
//   variant ,
//   size = "md",
//   isLoading = false,
//   leftIcon,
//   rightIcon,
//   className = "",
//   disabled,
//   ...props
// }) => {
//   /* ================== SIZE STYLES ================== */
//   const sizes = {
//     sm: "w-32 h-10 text-sm",
//     md: "w-36 h-12 text-base",
//     lg: "w-44 h-14 text-lg",
//   };

//   /* ================== BLOB COLORS ================== */
//   const getBlobColors = (variant: ButtonVariant | undefined) => {
//     switch (variant) {
//       case "danger":
//         return [
//           "bg-rose-400 group-hover:bg-rose-600",
//           "bg-red-500 group-hover:bg-pink-500",
//           "bg-pink-500 group-hover:bg-red-500",
//           "bg-rose-600 group-hover:bg-rose-400",
//         ];

//       case "primary":
//         return [
//           "bg-[#541388] group-hover:bg-[#F5A962]",
//           "bg-[#1768AC] group-hover:bg-[#A2D7D3]",
//           "bg-[#A2D7D3] group-hover:bg-[#1768AC]",
//           "bg-[#F5A962] group-hover:bg-[#541388]",
//         ];

//       default:
//         return [
//           "bg-gray-200 group-hover:bg-green-200",
//           "bg-orange-200 group-hover:bg-gray-200",
//           "bg-blue-200 group-hover:bg-orange-200",
//           "bg-green-200 group-hover:bg-blue-200",
//         ];
//     }
//   };

//   // ✅ FIX: Call the function
//   const blobColors = getBlobColors(variant);

//   const positions = [
//     "left-0 top-0",
//     "left-8 top-0",
//     "left-16 -top-6",
//     "left-[4.5rem] top-[1.8rem]",
//   ];

//   return (
//     <button
//       disabled={isLoading || disabled}
//       className={`
//         group relative overflow-hidden rounded-full
//         flex items-center justify-center
//         font-semibold text-white
//         transition-all duration-300
//         active:scale-95
//         disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
//         ${sizes[size]}
//         ${className}
//       `}
//       {...props}
//     >
//       {/* Glass Layer */}
//       <span
//         className="
//           absolute inset-0
//           flex items-center justify-center
//           rounded-full
//           bg-gradient-to-b from-white/40 to-white/10
//           backdrop-blur-md
//           z-20
//         "
//       >
//         {isLoading ? (
//           <svg
//             className="animate-spin h-5 w-5 text-white drop-shadow-md"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             />
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//             />
//           </svg>
//         ) : (
//           <div className="relative z-30 flex items-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
//             {leftIcon && <span>{leftIcon}</span>}
//             {children}
//             {rightIcon && <span>{rightIcon}</span>}
//           </div>
//         )}
//       </span>

//       {/* Blobs */}
//       {blobColors.map((color, index) => (
//         <span
//           key={index}
//           className={`
//             absolute ${positions[index]}
//             w-24 h-14 rounded-full
//             z-0 transition-all duration-300
//             group-hover:scale-125
//             ${color}
//           `}
//         />
//       ))}
//     </button>
//   );
// };

// export default Button;