"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { saleService } from "@/src/services/saleService";
import { CreateSaleInput, Sale } from "@/src/types/sale";

type SalesContextType = {
  sales: Sale[];
  loading: boolean;
  hasLoaded: boolean;
  loadSales: (force?: boolean) => Promise<Sale[]>;
  refreshSales: () => Promise<Sale[]>;
  processSale: (input: CreateSaleInput) => Promise<Sale>;
  addPayment: (saleId: string, amount: number) => Promise<Sale>;
};

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadSales = useCallback(async (force = false) => {
    if (hasLoaded && !force) {
      return sales;
    }

    setLoading(true);
    try {
      const data = await saleService.getAllSales();
      setSales(data);
      setHasLoaded(true);
      return data;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, sales]);

  const refreshSales = useCallback(async () => loadSales(true), [loadSales]);

  const processSale = useCallback(async (input: CreateSaleInput) => {
    const created = await saleService.processSale(input);
    setSales((prev) => [created, ...prev]);
    setHasLoaded(true);
    return created;
  }, []);

  const addPayment = useCallback(async (saleId: string, amount: number) => {
    const updated = await saleService.addPayment(saleId, amount);
    setSales((prev) => prev.map((item) => (item.id === saleId ? updated : item)));
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      sales,
      loading,
      hasLoaded,
      loadSales,
      refreshSales,
      processSale,
      addPayment,
    }),
    [sales, loading, hasLoaded, loadSales, refreshSales, processSale, addPayment]
  );

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within SalesProvider");
  }
  return context;
};
