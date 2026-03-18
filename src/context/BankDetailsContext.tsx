"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { BankDetails } from "../types/bankDetails";
import { allBankDetails } from "../Data/bankDetails";

type BankDetailsContextType = {
  selectedBankDetail: BankDetails;
  setSelectedBankDetailId: (id: string) => void;
};

const BankDetailsContext = createContext<BankDetailsContextType | undefined>(undefined);

export const BankDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBankDetail, setSelectedBankDetail] = useState<BankDetails>(allBankDetails[0]);

  const setSelectedBankDetailId = (id: string) => {
    const detail = allBankDetails.find((d) => d.id === id);
    if (detail) {
      setSelectedBankDetail(detail);
    }
  };

  const value = useMemo(
    () => ({
      selectedBankDetail,
      setSelectedBankDetailId,
    }),
    [selectedBankDetail]
  );

  return <BankDetailsContext.Provider value={value}>{children}</BankDetailsContext.Provider>;
};

export const useBankDetails = () => {
  const context = useContext(BankDetailsContext);
  if (!context) {
    throw new Error("useBankDetails must be used within BankDetailsProvider");
  }
  return context;
};
