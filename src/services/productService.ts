// src/services/productService.ts
import { BaseService } from './baseService';
import { Product } from '../types/product';
import { where, query, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

class ProductService extends BaseService<Product> {
    constructor() {
        super('products');
    }

    /**
     * Specialized method to check stock levels
     */
    async getLowStockProducts(threshold: number = 5): Promise<Product[]> {
        try {
            const results = await this.getAll([where('availableQty', '<=', threshold)]);
            return results;
        } catch (error) {
            console.error('[ProductService] Error fetching low stock products:', error);
            throw error;
        }
    }

    /**
     * Backward compatibility wrapper for addProduct
     */
    async addProduct(input: Omit<Product, 'id'>): Promise<Product> {
        return this.create(input);
    }

    /**
     * Backward compatibility wrapper for getAllProducts
     */
    async getAllProducts(): Promise<Product[]> {
        return this.getAll();
    }

    /**
     * Backward compatibility wrapper for updateProduct
     */
    async updateProduct(id: string, input: Partial<Product>): Promise<Product> {
        return this.update(id, input);
    }

    /**
     * Backward compatibility wrapper for deleteProduct
     */
    async deleteProduct(id: string): Promise<string> {
        await this.delete(id);
        return id;
    }
}

export const productService = new ProductService();
