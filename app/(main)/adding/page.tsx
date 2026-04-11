"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Product, CreateProductInput } from "@/src/types/product";
import AddNewProductForm from "@/src/components/AddNewProductForm";
import GenericTable from "@/src/components/GenericTable";
import Button from "@/src/components/Button";
import CloseButton from "@/src/components/CloseButton";
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useProducts } from "@/src/context/ProductsContext";

const INITIAL_FORM_DATA: CreateProductInput = {
  productId: "",
  productName: "",
  price: 0,
  discountedPrice: 0,
  cost: 0,
  availableQty: 0,
  imageUrl: "",
  description: "",
  batches: [],
};

const generateNextProductId = (existingProducts: Product[]) => {
  if (!existingProducts || existingProducts.length === 0) {
    return "SKU-100";
  }

  const numericIds = existingProducts
    .map((p) => {
      const match = p.productId.match(/SKU-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((id) => !isNaN(id));

  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 99;
  return `SKU-${maxId + 1}`;
};

export default function AddingPage() {
  const { logout } = useAuth();
  const { products, loading, loadProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] =
    useState<CreateProductInput>(INITIAL_FORM_DATA);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      discountedPrice: product.discountedPrice,
      cost: product.cost || 0,
      availableQty: product.availableQty,
      imageUrl: product.imageUrl,
      description: product.description,
      batches: product.batches || [],
    });
    setEditingId(product.id || null);
    setIsModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessor: "productId" as keyof Product,
        className: "text-gray-500 font-mono text-sm",
      },
      {
        header: "Product Name",
        accessor: (product: Product) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  ?
                </div>
              )}
            </div>
            <span className="text-gray-900 font-semibold text-sm">
              {product.productName}
            </span>
          </div>
        ),
      },
      {
        header: "Base Price",
        accessor: (product: Product) => `Rs. ${product.price.toLocaleString()}`,
        className: "text-gray-600 text-sm",
      },
      {
        header: "Offer Price",
        accessor: (product: Product) => (
          <span className="text-primary-600 font-bold text-sm">
            Rs. {product.discountedPrice.toLocaleString()}
          </span>
        ),
      },
      {
        header: "Inventory",
        accessor: (product: Product) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${product.availableQty > 10 ? "bg-emerald-400" : "bg-rose-400"}`}
              ></div>
              <span className="text-gray-700 font-medium text-sm">
                {product.availableQty} units
              </span>
            </div>
            {product.batches && product.batches.length > 0 && (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {product.batches.length} Batch(es)
              </span>
            )}
          </div>
        ),
      },
      {
        header: "Actions",
        accessor: (product: Product) => (
          <div className="flex items-center gap-2">
            <button
              title="Modify Product"
              onClick={() => handleEdit(product)}
              className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all hover:scale-110"
            >
              <Pencil size={18} />
            </button>
            <button
              title="Delete Product"
              onClick={() => handleDelete(product.id!)}
              className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all hover:scale-110"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [products],
  );

  const fetchProducts = useCallback(async () => {
    try {
      await loadProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products. Please check your connection.");
    }
  }, [loadProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM_DATA,
      productId: generateNextProductId(products),
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (editingId) {
        await updateProduct(editingId, formData);
      } else {
        await addProduct(formData);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Product Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and monitor your store items
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="primary"
            onClick={openModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Product
          </Button>
        </div>
      </header>

      <GenericTable<Product>
        data={products}
        columns={columns}
        isLoading={loading}
        emptyMessage="Your inventory is empty. Start by adding your first product using the button above."
        rowKey={(product) => product.id || product.productId}
      />

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
            onClick={resetForm}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-200">
            <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {editingId ? "Modify Product" : "New Product"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingId
                    ? "Update existing product details"
                    : "Fill in the details to add to inventory"}
                </p>
              </div>
              <CloseButton onClick={resetForm} />
            </header>

            <AddNewProductForm
              formData={formData}
              isLoading={isSaving}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              resetForm={resetForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
