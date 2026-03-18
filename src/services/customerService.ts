import { firebaseService } from './firebaseService';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '../types/customer';

const CUSTOMERS_COLLECTION = 'customers';

export const customerService = {
    /**
     * Register a new customer in the store.
     */
    async addCustomer(input: CreateCustomerInput): Promise<Customer> {
        try {
            const data = {
                ...input,
                loyaltyPoints: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const result = await firebaseService.addDocument(CUSTOMERS_COLLECTION, data);
            return result as Customer;
        } catch (error) {
            console.error('[customerService] addCustomer error:', error);
            throw new Error('Failed to register customer');
        }
    },

    /**
     * Retrieve all customers.
     */
    async getAllCustomers(): Promise<Customer[]> {
        try {
            const results = await firebaseService.getDocuments(CUSTOMERS_COLLECTION);
            return results as Customer[];
        } catch (error) {
            console.error('[customerService] getAllCustomers error:', error);
            throw new Error('Failed to fetch customers list');
        }
    },

    /**
     * Update customer details.
     */
    async updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
        try {
            const updated = await firebaseService.updateDocument(CUSTOMERS_COLLECTION, id, {
                ...input,
                updatedAt: new Date().toISOString()
            });
            return updated as Customer;
        } catch (error) {
            console.error('[customerService] updateCustomer error:', error);
            throw new Error(`Failed to update customer with ID ${id}`);
        }
    },

    /**
     * Remove a customer.
     */
    async deleteCustomer(id: string): Promise<string> {
        try {
            return await firebaseService.deleteDocument(CUSTOMERS_COLLECTION, id);
        } catch (error) {
            console.error('[customerService] deleteCustomer error:', error);
            throw new Error(`Failed to remove customer with ID ${id}`);
        }
    }
};
