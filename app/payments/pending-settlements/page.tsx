"use client";

import React from "react";
import PaymentsSettlementAndHistory from "@/src/components/payments/PaymentsSettlementAndHistory";

export default function PendingSettlementsPage() {
  return (
    <PaymentsSettlementAndHistory
      title="Pending Payment Settlements"
      subtitle="Track all balances that still need to be collected"
      showBackLink
    />
  );
}
