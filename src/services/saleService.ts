import { firebaseService } from './firebaseService';
import { CreateSaleInput, Sale } from '../types/sale';
import { ProductBatch } from '../types/product';
import { productService } from './productService';
import { paymentService } from './paymentService';

const SALES_COLLECTION = 'sales';

export const saleService = {
    /**
     * Process a new sale record.
     * Deducts inventory quantities first.
     */
    async processSale(input: CreateSaleInput): Promise<Sale> {
        try {
            // 1. Validate and Deduct inventory (ONLY if not a quotation)
            if (input.status !== 'quotation') {
                const currentProducts = await productService.getAllProducts();

                for (const item of input.items) {
                    const targetProduct = currentProducts.find(p => p.id === item.id);
                    if (!targetProduct) {
                        throw new Error(`Product ${item.productName} not found in inventory.`);
                    }

                    if (targetProduct.availableQty < item.qty) {
                        throw new Error(`Insufficient stock for ${item.productName}. (Requested: ${item.qty}, Available: ${targetProduct.availableQty})`);
                    }

                    // Update product quantity (FIFO deduction across batches)
                    let remainingToDeduct = item.qty;
                    let updatedBatches = [...(targetProduct.batches || [])];
                    
                    if (updatedBatches.length > 0) {
                        for (let i = 0; i < updatedBatches.length; i++) {
                            const batch = updatedBatches[i];
                            if (batch.availableQty <= 0) continue;
                            
                            const deduction = Math.min(batch.availableQty, remainingToDeduct);
                            updatedBatches[i] = {
                                ...batch,
                                availableQty: batch.availableQty - deduction
                            };
                            remainingToDeduct -= deduction;
                            
                            if (remainingToDeduct === 0) break;
                        }
                    } else {
                        // Support for products without batches (legacy)
                        targetProduct.availableQty -= remainingToDeduct;
                        remainingToDeduct = 0;
                    }

                    if (remainingToDeduct > 0) {
                      throw new Error(`Insufficient stock in batches for ${item.productName}. Please check batch quantities.`);
                    }

                    // Calculate new top-level values
                    const totalQty = updatedBatches.reduce((sum, b) => sum + b.availableQty, 0);
                    const firstActiveBatch = updatedBatches.find(b => b.availableQty > 0);
                    
                    let updateData: any = {
                        availableQty: totalQty,
                        batches: updatedBatches
                    };

                    // Update top-level prices to match the next available batch
                    if (firstActiveBatch) {
                        updateData.price = firstActiveBatch.price;
                        updateData.discountedPrice = firstActiveBatch.price;
                        updateData.cost = firstActiveBatch.cost;
                    }

                    await productService.updateProduct(item.id, updateData);
                }
            }

            const nowIso = new Date().toISOString();
            const initialPaidAmount = input.paidAmount || 0;
            const initialBalanceAmount = input.balanceAmount ?? Math.max(input.total - initialPaidAmount, 0);

            const initialPaymentTransactions = initialPaidAmount > 0
                ? [
                    {
                        id: `pay_${Date.now()}`,
                        amount: initialPaidAmount,
                        paidAt: nowIso,
                        paidAmountAfter: initialPaidAmount,
                        balanceAmountAfter: initialBalanceAmount,
                    }
                ]
                : [];

            // 2. Save sale record
            const result = await firebaseService.addDocument(SALES_COLLECTION, {
                ...input,
                paymentTransactions: initialPaymentTransactions,
                createdAt: nowIso,
                updatedAt: nowIso
            });

            return result as Sale;
        } catch (error) {
            console.error('[saleService] processSale failing:', error);
            throw error;
        }
    },

    /**
     * Fetch all sales records
     */
    async getAllSales(): Promise<Sale[]> {
        try {
            const results = await firebaseService.getDocuments(SALES_COLLECTION);
            return results as Sale[];
        } catch (error) {
            console.error('[saleService] getAllSales error:', error);
            throw new Error('Failed to fetch sales history');
        }
    },

    /**
     * Add a part/full payment to an existing pending sale.
     * Redirects to paymentService.
     */
    async addPayment(saleId: string, amount: number): Promise<Sale> {
        return paymentService.addPaymentToSale(saleId, amount);
    }
};
