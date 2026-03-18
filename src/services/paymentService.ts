import { firebaseService } from './firebaseService';
import { Sale } from '../types/sale';

const SALES_COLLECTION = 'sales';

export const paymentService = {
    /**
     * Add a part or full payment to an existing sale.
     * Updates paidAmount, balanceAmount, status, and paymentTransactions.
     */
    async addPaymentToSale(saleId: string, amount: number): Promise<Sale> {
        try {
            if (!saleId) {
                throw new Error('Sale ID is required');
            }

            if (!Number.isFinite(amount) || amount <= 0) {
                throw new Error('Payment amount must be greater than zero');
            }

            const existingSale = await firebaseService.getDocument(SALES_COLLECTION, saleId) as Sale | null;
            if (!existingSale) {
                throw new Error('Sale not found');
            }

            const total = existingSale.total;
            const currentPaidAmount = existingSale.paidAmount || 0;
            const currentBalanceAmount = existingSale.balanceAmount ?? Math.max(total - currentPaidAmount, 0);

            if (currentBalanceAmount <= 0) {
                throw new Error('This sale has no pending balance');
            }

            if (amount > currentBalanceAmount) {
                throw new Error(`Payment cannot exceed pending balance (Rs. ${currentBalanceAmount.toLocaleString()})`);
            }

            const nextPaidAmount = currentPaidAmount + amount;
            const nextBalanceAmount = Math.max(total - nextPaidAmount, 0);

            // Logic for status: if balance is 0, it's completed. Otherwise it's pending-payment.
            // Note: If it was a 'quotation', adding a payment should probably change it to 'pending-payment' or 'completed'.
            let nextStatus: Sale['status'] = nextBalanceAmount === 0 ? 'completed' : 'pending-payment';

            const paymentTimestamp = new Date().toISOString();
            const nextPaymentTransactions = [
                ...(existingSale.paymentTransactions || []),
                {
                    id: `pay_${Date.now()}`,
                    amount,
                    paidAt: paymentTimestamp,
                    paidAmountAfter: nextPaidAmount,
                    balanceAmountAfter: nextBalanceAmount,
                }
            ];

            const updateData: Partial<Sale> = {
                paidAmount: nextPaidAmount,
                balanceAmount: nextBalanceAmount,
                status: nextStatus,
                paymentTransactions: nextPaymentTransactions,
                updatedAt: paymentTimestamp,
            };

            await firebaseService.updateDocument(SALES_COLLECTION, saleId, updateData);

            return {
                ...existingSale,
                ...updateData,
                id: saleId,
            } as Sale;
        } catch (error) {
            console.error('[paymentService] addPaymentToSale error:', error);
            throw error;
        }
    }
};
