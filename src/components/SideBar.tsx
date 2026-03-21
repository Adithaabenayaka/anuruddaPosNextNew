"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Package,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user || pathname === "/login") return null;

  const navItems = [
    { name: "Sales", href: "/sales", icon: ShoppingCart },
    { name: "Orders", href: "/orders", icon: CreditCard },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Customers", href: "/customers", icon: Users },
  ];

  return (
    <div className="fixed left-0 top-0 w-72 h-screen bg-gray-100 p-5 flex flex-col justify-between">

      {/* TOP */}
      <div className="flex flex-col gap-6">

        {/* Main */}
        <div>
          <h2 className="text-md font-semibold text-gray-700 mb-4">Main</h2>

          {/* Dashboard (keep your style) */}
          <Link href="/">
            <div
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer
              ${pathname === "/"
                  ? "bg-orange-100 text-orange-500"
                  : "text-gray-700 hover:bg-gray-200"
                }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} />
                <span className="text-sm">Dashboard</span>
              </div>
              <div className="bg-orange-200 p-1 rounded-full">
                <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          {/* Super Admin */}
          <div className="flex items-center justify-between mt-4 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <User size={20} />
              <span className="text-sm">Super Admin</span>
            </div>
            <div className="bg-gray-200 p-1 rounded-full">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>

        <hr className="border-gray-300" />

        {/* Navigation (from Navbar) */}
        <div>
          <h2 className="text-md font-semibold text-gray-700 mb-4">
            Navigation
          </h2>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm
                  ${isActive
                      ? "bg-orange-100 text-orange-500"
                      : "text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="flex flex-col gap-4">

        {/* User Info */}
        <div className="px-3">
          <p className="text-sm font-semibold text-gray-900">
            {user.email?.split("@")[0] || "Admin"}
          </p>
          <p className="text-xs text-gray-400 uppercase">Manager</p>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm bg-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;