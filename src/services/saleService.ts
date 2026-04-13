// src/services/saleService.ts
import { BaseService } from './baseService';
import { CreateSaleInput, Sale } from '../types/sale';
import { productService } from './productService';
import { paymentService } from './paymentService';

class SaleService extends BaseService<Sale> {
    constructor() {
        super('sales');
    }

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

                    await productService.updateProduct(item.id!, updateData);
                }
            }

            const initialPaidAmount = input.paidAmount || 0;
            const initialBalanceAmount = input.balanceAmount ?? Math.max(input.total - initialPaidAmount, 0);

            const initialPaymentTransactions = initialPaidAmount > 0
                ? [
                    {
                        id: `pay_${Date.now()}`,
                        amount: initialPaidAmount,
                        paidAt: new Date().toISOString(),
                        paidAmountAfter: initialPaidAmount,
                        balanceAmountAfter: initialBalanceAmount,
                    }
                ]
                : [];

            // 2. Save sale record using BaseService.create
            return await this.create({
                ...input,
                paymentTransactions: initialPaymentTransactions,
            } as any);
        } catch (error) {
            console.error('[SaleService] processSale failing:', error);
            throw error;
        }
    }

    /**
     * Fetch a single sale record by ID
     */
    async getSaleById(id: string): Promise<Sale | null> {
        return this.getById(id);
    }

    /**
     * Update an existing sale record
     */
    async updateSale(id: string, input: Partial<Sale>): Promise<Sale> {
        // Transition logic from draft/quotation to completed/pending-payment
        if (input.status && (input.status === 'completed' || input.status === 'pending-payment')) {
            const existingSale = await this.getSaleById(id);
            if (existingSale && (existingSale.status === 'draft' || existingSale.status === 'quotation')) {
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
                    await productService.updateProduct(item.id!, {
                        availableQty: totalQty,
                        batches: updatedBatches
                    });
                }
            }
        }

        return this.update(id, input);
    }

    /**
     * Delete a sale record and restore inventory if needed.
     */
    async deleteSale(id: string): Promise<string> {
        try {
            const sale = await this.getSaleById(id);
            if (!sale) {
                throw new Error("Sale not found.");
            }

            // Restore inventory ONLY if it was deducted
            if (sale.status === 'completed' || sale.status === 'pending-payment') {
                const currentProducts = await productService.getAllProducts();

                for (const item of sale.items) {
                    const targetProduct = currentProducts.find(p => p.id === item.id);
                    if (!targetProduct) continue;

                    let updatedBatches = [...(targetProduct.batches || [])];
                    const qtyToRestore = item.qty;

                    if (updatedBatches.length > 0) {
                        let batchIndex = updatedBatches.findIndex(b => b.label === item.batchLabel);
                        if (batchIndex === -1) batchIndex = 0;

                        updatedBatches[batchIndex] = {
                            ...updatedBatches[batchIndex],
                            availableQty: updatedBatches[batchIndex].availableQty + qtyToRestore
                        };
                    } else {
                        targetProduct.availableQty += qtyToRestore;
                    }

                    const totalQty = updatedBatches.length > 0 
                        ? updatedBatches.reduce((sum, b) => sum + b.availableQty, 0) 
                        : targetProduct.availableQty;

                    await productService.updateProduct(item.id!, {
                        availableQty: totalQty,
                        batches: updatedBatches
                    });
                }
            }

            await this.delete(id);
            return id;
        } catch (error) {
            console.error('[SaleService] deleteSale error:', error);
            throw error;
        }
    }

    /**
     * Fetch all sales records
     */
    async getAllSales(): Promise<Sale[]> {
        return this.getAll();
    }

    /**
     * Add a part/full payment to an existing pending sale.
     */
    async addPayment(saleId: string, amount: number): Promise<Sale> {
        return paymentService.addPaymentToSale(saleId, amount);
    }
}

export const saleService = new SaleService();
