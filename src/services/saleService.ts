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
            // 1. Validate and Deduct inventory (ONLY if not a quotation or draft)
            if (input.status !== 'quotation' && input.status !== 'draft') {
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
     * Fetch a single sale record by ID
     */
    async getSaleById(id: string): Promise<Sale | null> {
        return firebaseService.getDocument(SALES_COLLECTION, id) as Promise<Sale | null>;
    },

    /**
     * Update an existing sale record
     */
    async updateSale(id: string, input: Partial<Sale>): Promise<Sale> {
        // If updating status to something other than draft/quotation, we might need inventory deduction
        // But for simplicity in this POS, we usually deduct on "process" (conversion from draft to sale)
        // If we transition from draft -> completed, we should trigger inventory deduction.
        
        // Let's handle the transition from draft/quotation to completed/pending-payment
        if (input.status && (input.status === 'completed' || input.status === 'pending-payment')) {
            const existingSale = await this.getSaleById(id);
            if (existingSale && (existingSale.status === 'draft' || existingSale.status === 'quotation')) {
                // Deduct inventory now using the NEW items (in case they were modified during resume)
                const itemsToDeduct = input.items || existingSale.items;
                const currentProducts = await productService.getAllProducts();

                for (const item of itemsToDeduct) {
                    const targetProduct = currentProducts.find(p => p.id === item.id);
                    if (!targetProduct) continue;
                    
                    let remainingToDeduct = item.qty;
                    let updatedBatches = [...(targetProduct.batches || [])];
                    
                    if (updatedBatches.length > 0) {
                        for (let i = 0; i < updatedBatches.length; i++) {
                            const batch = updatedBatches[i];
                            if (batch.availableQty <= 0) continue;
                            const deduction = Math.min(batch.availableQty, remainingToDeduct);
                            updatedBatches[i] = { ...batch, availableQty: batch.availableQty - deduction };
                            remainingToDeduct -= deduction;
                            if (remainingToDeduct === 0) break;
                        }
                    } else {
                        targetProduct.availableQty -= remainingToDeduct;
                    }

                    const totalQty = updatedBatches.length > 0 ? updatedBatches.reduce((sum, b) => sum + b.availableQty, 0) : targetProduct.availableQty;
                    await productService.updateProduct(item.id, {
                        availableQty: totalQty,
                        batches: updatedBatches
                    });
                }
            }
        }

        const result = await firebaseService.updateDocument(SALES_COLLECTION, id, input);
        return result as Sale;
    },

    /**
     * Delete a sale record
     */
    async deleteSale(id: string): Promise<string> {
        return firebaseService.deleteDocument(SALES_COLLECTION, id);
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
