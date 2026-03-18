"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { customerService } from "@/src/services/customerService";
import { CreateCustomerInput, Customer, UpdateCustomerInput } from "@/src/types/customer";

type CustomersContextType = {
  customers: Customer[];
  loading: boolean;
  hasLoaded: boolean;
  loadCustomers: (force?: boolean) => Promise<Customer[]>;
  refreshCustomers: () => Promise<Customer[]>;
  addCustomer: (input: CreateCustomerInput) => Promise<Customer>;
  updateCustomer: (id: string, input: UpdateCustomerInput) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<string>;
};

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export const CustomersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadCustomers = useCallback(async (force = false) => {
    if (hasLoaded && !force) {
      return customers;
    }

    setLoading(true);
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
      setHasLoaded(true);
      return data;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, customers]);

  const refreshCustomers = useCallback(async () => loadCustomers(true), [loadCustomers]);

  const addCustomer = useCallback(async (input: CreateCustomerInput) => {
    const created = await customerService.addCustomer(input);
    setCustomers((prev) => [created, ...prev]);
    setHasLoaded(true);
    return created;
  }, []);

  const updateCustomer = useCallback(async (id: string, input: UpdateCustomerInput) => {
    const updated = await customerService.updateCustomer(id, input);
    setCustomers((prev) => prev.map((item) => (item.id === id ? { ...item, ...input } : item)));
    return updated;
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    const deletedId = await customerService.deleteCustomer(id);
    setCustomers((prev) => prev.filter((item) => item.id !== id));
    return deletedId;
  }, []);

  const value = useMemo(
    () => ({
      customers,
      loading,
      hasLoaded,
      loadCustomers,
      refreshCustomers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
    }),
    [customers, loading, hasLoaded, loadCustomers, refreshCustomers, addCustomer, updateCustomer, deleteCustomer]
  );

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>;
};

export const useCustomers = () => {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error("useCustomers must be used within CustomersProvider");
  }
  return context;
};
