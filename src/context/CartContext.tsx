"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { Product } from "../types/product";
import { SaleItem } from "../types/sale";

type CartContextType = {
    cart: SaleItem[];
    loading: boolean;
    hasLoaded: boolean;
    cartTotal: number;

    setCart: React.Dispatch<React.SetStateAction<SaleItem[]>>;
    addToCart: (product: Product, batchId?: string) => void;
    updatePrice: (id: string, price: string, batchId?: string | null) => void;
    removeFromCart: (id: string, batchId?: string | null) => void;
    updateQty: (id: string, qty: number, batchId?: string | null) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [loading] = useState(false);
    const [hasLoaded] = useState(true);

    /**
     * CART TOTAL
     */
    const cartTotal = useMemo(
        () => cart.reduce((total, item) => total + (parseFloat(item.price) || 0) * item.qty, 0),
        [cart]
    );

    /**
     * ADD TO CART
     * - Logic moved from SalesPage to keep it centralized
     */
    const addToCart = useCallback((product: Product, batchId?: string) => {
        if (product.availableQty <= 0) {
            alert("This item is out of stock!");
            return;
        }

        const firstAvailableBatch = product.batches?.find(b => b.availableQty > 0);
        const activeBatchId = batchId || firstAvailableBatch?.id;
        const selectedBatch = product.batches?.find(b => b.id === activeBatchId);

        // Determine the selling price vs original price
        const batchPrice = selectedBatch ? selectedBatch.price : product.price;
        const batchDiscountPrice = selectedBatch ? selectedBatch.discountedPrice : product.discountedPrice;
        const itemOriginalPrice = batchPrice;
        const itemPrice = batchDiscountPrice !== undefined && batchDiscountPrice > 0 ? batchDiscountPrice : batchPrice;
        const itemCost = selectedBatch ? selectedBatch.cost : product.cost;

        const itemAvailableQty = selectedBatch ? selectedBatch.availableQty : product.availableQty;

        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id && item.batchId === (activeBatchId || null));
            if (existing) {
                if (existing.qty >= itemAvailableQty) {
                    alert(`Only ${itemAvailableQty} units available in this batch.`);
                    return prev;
                }
                return prev.map((item) =>
                    (item.id === product.id && item.batchId === (activeBatchId || null)) ? { ...item, qty: item.qty + 1 } : item
                );
            }

            return [
                ...prev,
                {
                    id: product.id!,
                    productId: product.productId,
                    productName: product.productName,
                    price: itemPrice.toString(),
                    originalPrice: itemOriginalPrice,
                    catalogPrice: itemPrice,
                    cost: itemCost,
                    qty: 1,
                    batchId: activeBatchId || null,
                    batchLabel: selectedBatch?.label || null,
                },
            ];
        });
    }, []);

    /**
     * UPDATE PRICE (Manual Override)
     */
    const updatePrice = useCallback(
        (id: string, price: string, batchId?: string | null) => {
            setCart((prev) =>
                prev.map((item) =>
                    item.id === id && item.batchId === (batchId || null)
                        ? { ...item, price }
                        : item
                )
            );
        },
        []
    );

    /**
     * REMOVE FROM CART
     */
    const removeFromCart = useCallback(
        (id: string, batchId?: string | null) => {
            setCart((prev) =>
                prev.filter(
                    (item) => !(item.id === id && item.batchId === (batchId || null))
                )
            );
        },
        []
    );

    /**
     * UPDATE QUANTITY
     */
    const updateQty = useCallback(
        (id: string, qty: number, batchId?: string | null) => {
            if (qty < 1) return;

            setCart((prev) =>
                prev.map((item) =>
                    item.id === id && item.batchId === (batchId || null)
                        ? { ...item, qty }
                        : item
                )
            );
        },
        []
    );

    /**
     * CLEAR CART
     */
    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const value = useMemo(
        () => ({
            cart,
            loading,
            hasLoaded,
            cartTotal,
            setCart,
            addToCart,
            updatePrice,
            removeFromCart,
            updateQty,
            clearCart,
        }),
        [cart, loading, hasLoaded, cartTotal, addToCart, updatePrice, removeFromCart, updateQty, clearCart]
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within CartProvider");
    }
    return context;
};