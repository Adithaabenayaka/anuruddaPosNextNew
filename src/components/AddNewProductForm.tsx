import React from "react";
import { CreateProductInput } from "@/src/types/product";
import Button from "./Button";
import { Plus, Trash2 } from "lucide-react";

interface AddNewProductFormProps {
  formData: CreateProductInput;
  isLoading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
}

const AddNewProductForm: React.FC<AddNewProductFormProps> = ({
  formData,
  isLoading,
  handleChange,
  handleSubmit,
  resetForm,
}) => {
  return (
    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider">
            Product ID <span className="text-rose-500">*</span>
          </label>
          <input
            required
            name="productId"
            type="text"
            value={formData.productId}
            onChange={handleChange}
            disabled={true}
            className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 placeholder:text-gray-300 text-sm"
            placeholder="SKU-XXX"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider">
            Product Name <span className="text-rose-500">*</span>
          </label>
          <input
            required
            name="productName"
            type="text"
            value={formData.productName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 text-sm"
            placeholder="Enter name"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
          <input
            name="imageUrl"
            type="text"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 text-sm"
            placeholder="https://images.unsplash.com/..."
          />
        </div>
        <div className="md:col-span-2 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Inventory Batches</h3>
            <button
              type="button"
              onClick={() => {
                const newBatch = {
                  id: `batch_${Date.now()}`,
                  cost: formData.cost || "",
                  price: formData.price || "",
                  discountedPrice: formData.discountedPrice || undefined,
                  availableQty: 0,
                  createdAt: new Date().toISOString(),
                  label: `Batch ${new Date().toLocaleDateString()}`
                };
                const updatedBatches = [...(formData.batches || []), newBatch];
                // Simulate handleChange with a custom object
                const event = {
                  target: { name: 'batches', value: updatedBatches }
                } as any;
                handleChange(event);
              }}
              className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-wider flex items-center gap-1"
            >
              <Plus size={12} /> Add New Batch
            </button>
          </div>

          <div className="space-y-3">
            {formData.batches && formData.batches.length > 0 ? (
              formData.batches.map((batch, index) => (
                <div key={batch.id} className="grid grid-cols-12 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 items-end">
                  <div className="col-span-4 space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Label</label>
                    <input
                      type="text"
                      value={batch.label}
                      onChange={(e) => {
                        const updated = [...formData.batches!];
                        updated[index].label = e.target.value;
                        handleChange({ target: { name: 'batches', value: updated } } as any);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Cost</label>
                    <input
                      type="number"
                      value={batch.cost}
                      onChange={(e) => {
                        const updated = [...formData.batches!];
                        updated[index].cost = Number(e.target.value);
                        handleChange({ target: { name: 'batches', value: updated } } as any);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Regular Price</label>
                    <input
                      type="number"
                      value={batch.price}
                      onChange={(e) => {
                        const updated = [...formData.batches!];
                        updated[index].price = Number(e.target.value);
                        handleChange({ target: { name: 'batches', value: updated } } as any);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Discount Price</label>
                    <input
                      type="number"
                      value={batch.discountedPrice || ''}
                      onChange={(e) => {
                        const updated = [...formData.batches!];
                        updated[index].discountedPrice = e.target.value ? Number(e.target.value) : undefined;
                        handleChange({ target: { name: 'batches', value: updated } } as any);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Qty</label>
                    <input
                      type="number"
                      value={batch.availableQty}
                      onChange={(e) => {
                        const updated = [...formData.batches!];
                        updated[index].availableQty = Number(e.target.value);

                        // Sync top-level fields from the first batch
                        const firstBatch = updated[0] || {};
                        const totalQty = updated.reduce((sum, b) => sum + b.availableQty, 0);

                        handleChange({ target: { name: 'batches', value: updated } } as any);
                        handleChange({ target: { name: 'availableQty', value: totalQty, type: 'number' } } as any);
                        if (updated[0]) {
                          handleChange({ target: { name: 'price', value: updated[0].price, type: 'number' } } as any);
                          handleChange({ target: { name: 'discountedPrice', value: updated[0].discountedPrice || updated[0].price, type: 'number' } } as any);
                          handleChange({ target: { name: 'cost', value: updated[0].cost, type: 'number' } } as any);
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.batches!.filter((_, i) => i !== index);
                        const totalQty = updated.reduce((sum, b) => sum + b.availableQty, 0);
                        handleChange({ target: { name: 'batches', value: updated } } as any);
                        handleChange({ target: { name: 'availableQty', value: totalQty, type: 'number' } } as any);
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-400 font-medium">No batches defined. Using default product settings.</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 pt-4 border-t border-gray-100 space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all resize-none placeholder:text-gray-300 text-sm"
            placeholder="Key features, specs..."
          ></textarea>
        </div>
      </div>

      <footer className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
        <Button
          type="button"
          size="sm"
          onClick={resetForm}
        >
          Discard
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="submit"
          isLoading={isLoading}
        >
          {isLoading ? "Saving..." : "Save Product"}
        </Button>
      </footer>
    </form>
  );
};

export default AddNewProductForm;

