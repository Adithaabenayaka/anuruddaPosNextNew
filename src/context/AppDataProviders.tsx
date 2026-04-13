"use client";

import React from "react";
import { CustomersProvider } from "@/src/context/CustomersContext";
import { ProductsProvider } from "@/src/context/ProductsContext";
import { SalesProvider } from "@/src/context/SalesContext";
import { BankDetailsProvider } from "@/src/context/BankDetailsContext";
import { CartProvider } from "@/src/context/CartContext";

export const AppDataProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BankDetailsProvider>
      <CartProvider>
        <ProductsProvider>
          <CustomersProvider>
            <SalesProvider>{children}</SalesProvider>
          </CustomersProvider>
        </ProductsProvider>
      </CartProvider>
    </BankDetailsProvider>
  );
};
