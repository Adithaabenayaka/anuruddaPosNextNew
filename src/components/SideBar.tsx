"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Package,
  Users,
  LayoutGrid,
  X,
  Menu,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import Image from "next/image";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  if (!user || pathname === "/login") return null;

  const navItems = [
    { name: "Sales", href: "/sales", icon: ShoppingCart },
    { name: "Orders", href: "/orders", icon: CreditCard },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Customers", href: "/customers", icon: Users },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <div className="no-print">
      {/* Mobile Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-gray-100 text-gray-600 hover:text-primary transition-colors"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Backdrop (Mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-all duration-300 ease-in-out
          w-64 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header/Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50 bg-white">
          <div className="flex mt-2 items-center">
            <Image
              src="/mainLogo/Logo.png"
              alt="Logo"
              width={110}
              height={90}
              className="object-contain cursor-pointer"
              onClick={() => handleNavigation("/")}
            />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {/* Main Section */}
          <div>
            <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Dashboard
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigation("/")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${pathname === "/"
                    ? "bg-primary-50 text-primary shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"}
                  `}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid size={18} className={pathname === "/" ? "text-primary" : "text-gray-400 group-hover:text-primary"} />
                  <span className="text-sm font-semibold">Home</span>
                </div>
                <ChevronRight size={14} className={pathname === "/" ? "text-primary/70" : "text-gray-300 group-hover:text-primary/70"} />
              </button>
            </div>
          </div>

          {/* Sales Section */}
          <div>
            <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Management
            </h3>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                        ${isActive
                        ? "bg-primary-50 text-primary shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"}
                      `}
                  >
                    <item.icon size={18} className={`mr-3 ${isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"}`} />
                    <span className="text-sm font-semibold">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-50 mt-auto">
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered by</p>
            <p className="text-xs font-bold text-primary">Dreams POS</p>
          </div>
        </div>
      </aside>
    </ div>
  );
};

export default Sidebar;