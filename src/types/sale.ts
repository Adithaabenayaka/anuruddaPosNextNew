
export interface SaleItem {
    id: string; // The Firestore document ID
    productId: string; // The custom SKU-XXX ID
    productName: string;
    price: string;
    originalPrice?: number | null;
    catalogPrice?: number | null;
    cost: number;
    qty: number;
    batchId?: string | null; // Link to specific product batch
    batchLabel?: string | null; // Label of the batch at time of sale
}

export interface PaymentTransaction {
    id: string;
    amount: number;
    paidAt: string;
    paidAmountAfter?: number;
    balanceAmountAfter?: number;
}

export type SaleStatus = 'completed' | 'pending-payment' | 'quotation' | 'draft';

export interface Sale {
    id?: string;
    customerId?: string | null; // Link to registered customer
    buyerName: string;
    items: SaleItem[];
    total: number;
    paidAmount?: number; // How much was actually paid
    balanceAmount?: number; // How much is pending
    paymentTransactions?: PaymentTransaction[];
    status: SaleStatus;
    createdAt?: string;
    updatedAt?: string;
}

export type CreateSaleInput = Omit<Sale, 'id' | 'createdAt'>;
