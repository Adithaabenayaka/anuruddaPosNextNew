"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { productService } from "@/src/services/productService";
import { CreateProductInput, Product, UpdateProductInput } from "@/src/types/product";

type ProductsContextType = {
  products: Product[];
  loading: boolean;
  hasLoaded: boolean;
  loadProducts: (force?: boolean) => Promise<Product[]>;
  refreshProducts: () => Promise<Product[]>;
  addProduct: (input: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, input: UpdateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<string>;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadProducts = useCallback(async (force = false) => {
    if (hasLoaded && !force) {
      return products;
    }

    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
      setHasLoaded(true);
      return data;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, products]);

  const refreshProducts = useCallback(async () => loadProducts(true), [loadProducts]);

  const addProduct = useCallback(async (input: CreateProductInput) => {
    const created = await productService.addProduct(input);
    setProducts((prev) => [created, ...prev]);
    setHasLoaded(true);
    return created;
  }, []);

  const updateProduct = useCallback(async (id: string, input: UpdateProductInput) => {
    const updated = await productService.updateProduct(id, input);
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...input } : item)));
    return updated;
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const deletedId = await productService.deleteProduct(id);
    setProducts((prev) => prev.filter((item) => item.id !== id));
    return deletedId;
  }, []);

  const value = useMemo(
    () => ({
      products,
      loading,
      hasLoaded,
      loadProducts,
      refreshProducts,
      addProduct,
      updateProduct,
      deleteProduct,
    }),
    [products, loading, hasLoaded, loadProducts, refreshProducts, addProduct, updateProduct, deleteProduct]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }
  return context;
};
