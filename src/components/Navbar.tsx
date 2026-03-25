"use client";

import { usePathname } from "next/navigation";
import {
  LogOut
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useBankDetails } from "@/src/context/BankDetailsContext";
import { allBankDetails } from "@/src/Data/bankDetails";
import Image from "next/image";

const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { selectedBankDetail, setSelectedBankDetailId } = useBankDetails();

  // Don't show navbar on login page or if not logged in
  if (!user || pathname === "/login") return null;


  return (
    <nav className=" w-full bg-white no-print ">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end h-14">


          <div className="flex items-center gap-4">
            {/* Bank Details Switcher */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-2">
              <div className="flex items-center gap-3">
                {allBankDetails.map((bank) => {
                  const isSelected = selectedBankDetail.id === bank.id;

                  return (
                    <label
                      key={bank.id}
                      className={`
            relative flex items-center justify-center
            w-8 h-8 rounded-full cursor-pointer
            transition-all duration-200
            border
            group
            ${isSelected
                          ? "border-primary shadow-md scale-105 bg-white"
                          : "border-gray-200 bg-white hover:scale-105"}
          `}
                    >
                      <input
                        type="radio"
                        name="bankDetail"
                        className="hidden"
                        checked={isSelected}
                        onChange={() => setSelectedBankDetailId(bank.id)}
                      />

                      {/* Bank Image */}
                      <img
                        src={bank.logo}
                        alt={bank.AccHolderName}
                        className="w-6 h-6 object-contain"
                      />

                      {/* Optional selection indicator */}
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />
                      )}

                      {/* Tooltip */}
                      {/* Tooltip BELOW */}
                      <span className="absolute top-full mt-2 px-2 py-1 rounded bg-gray-800 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {bank.AccHolderName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-extrabold text-gray-900 leading-none">
                {user.email?.split("@")[0] || "Admin"}
              </span>
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                Manager
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-100"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
