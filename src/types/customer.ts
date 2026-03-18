export interface Customer {
    id?: string;
    customerName: string;
    phone: string;
    email?: string;
    address?: string;
    loyaltyPoints?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;
