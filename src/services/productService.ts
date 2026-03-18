import { firebaseService } from './firebaseService';
import { Product, CreateProductInput, UpdateProductInput } from '../types/product';

const PRODUCTS_COLLECTION = 'products';

export const productService = {
    /**
     * Create a new product in the store.
     * @param input - The product details to add.
     * @returns The newly created product with its Firebase ID.
     */
    async addProduct(input: CreateProductInput): Promise<Product> {
        try {
            const data = {
                ...input,
                // Additional domain logic or validation can go here
            };
            const result = await firebaseService.addDocument(PRODUCTS_COLLECTION, data);
            return result as Product;
        } catch (error) {
            console.error('[productService] addProduct error:', error);
            throw new Error('Failed to add product to inventory');
        }
    },

    /**
     * Retrieve all products list from the store.
     * @returns A list of products.
     */
    async getAllProducts(): Promise<Product[]> {
        try {
            const results = await firebaseService.getDocuments(PRODUCTS_COLLECTION);
            return results as Product[];
        } catch (error) {
            console.error('[productService] getAllProducts error:', error);
            throw new Error('Failed to fetch products inventory');
        }
    },

    /**
     * Update an existing product details.
     * @param id - The unique ID of the product in Firebase.
     * @param input - Partial product details to update.
     */
    async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
        try {
            const updated = await firebaseService.updateDocument(PRODUCTS_COLLECTION, id, input);
            return updated as Product;
        } catch (error) {
            console.error('[productService] updateProduct error:', error);
            throw new Error(`Failed to update product with ID ${id}`);
        }
    },

    /**
     * Remove a product from the inventory permanently.
     * @param id - The unique ID of the product to delete.
     */
    async deleteProduct(id: string): Promise<string> {
        try {
            return await firebaseService.deleteDocument(PRODUCTS_COLLECTION, id);
        } catch (error) {
            console.error('[productService] deleteProduct error:', error);
            throw new Error(`Failed to remove product with ID ${id}`);
        }
    }
};
