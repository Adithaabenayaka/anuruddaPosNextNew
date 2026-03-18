export interface ProductBatch {
    id: string; // Internal ID or date-code
    cost: number;
    price: number;
    discountedPrice?: number;
    availableQty: number;
    createdAt: string;
    label?: string; // Optional name like "Batch A"
}

export interface Product {
    id?: string;
    productId: string;
    productName: string;
    price: number;
    discountedPrice: number;
    cost: number;
    availableQty: number;
    imageUrl: string;
    description: string;
    batches?: ProductBatch[];
    createdAt?: string;
    updatedAt?: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;
