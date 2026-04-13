// src/services/customerService.ts
import { BaseService } from './baseService';
import { Customer } from '../types/customer';

class CustomerService extends BaseService<Customer> {
    constructor() {
        super('customers');
    }

    /**
     * Backward compatibility wrapper for addCustomer
     */
    async addCustomer(input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
        const data = {
            ...input,
            loyaltyPoints: 0,
        };
        return this.create(data as any);
    }

    /**
     * Backward compatibility wrapper for getAllCustomers
     */
    async getAllCustomers(): Promise<Customer[]> {
        return this.getAll();
    }

    /**
     * Backward compatibility wrapper for updateCustomer
     */
    async updateCustomer(id: string, input: Partial<Customer>): Promise<Customer> {
        return this.update(id, input);
    }

    /**
     * Backward compatibility wrapper for deleteCustomer
     */
    async deleteCustomer(id: string): Promise<string> {
        await this.delete(id);
        return id;
    }
}

export const customerService = new CustomerService();
