"use client";

import React from "react";
import { CustomersProvider } from "@/src/context/CustomersContext";
import { ProductsProvider } from "@/src/context/ProductsContext";
import { SalesProvider } from "@/src/context/SalesContext";
import { BankDetailsProvider } from "@/src/context/BankDetailsContext";

export const AppDataProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BankDetailsProvider>
      <ProductsProvider>
        <CustomersProvider>
          <SalesProvider>{children}</SalesProvider>
        </CustomersProvider>
      </ProductsProvider>
    </BankDetailsProvider>
  );
};
