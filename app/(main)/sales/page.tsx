"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ShoppingCart, User, Plus, CheckCircle2, Printer, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/src/types/product";
import { Customer } from "@/src/types/customer";
import { SaleItem, SaleStatus, Sale } from "@/src/types/sale";
import { useProducts } from "@/src/context/ProductsContext";
import { useCustomers } from "@/src/context/CustomersContext";
import { useSales } from "@/src/context/SalesContext";
import Button from "@/src/components/Button";
import ReceiptPrint from "@/src/components/ReceiptPrint";
import CloseButton from "@/src/components/CloseButton";
import Summary from "@/src/components/payments/sales/Summary";


export default function SalesPage() {
  const router = useRouter();
  const { products, loadProducts, refreshProducts } = useProducts();
  const { customers, loadCustomers } = useCustomers();
  const { processSale } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isQuotation, setIsQuotation] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastProcessedSale, setLastProcessedSale] = useState<Sale | null>(null);
  const searchParams = useSearchParams();
  const resumedSaleId = searchParams.get("resume");
  const { getSaleById, updateSale } = useSales();


  // Load Data
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadProducts(),
        loadCustomers()
      ]);

      // If resuming a sale, load its details
      if (resumedSaleId) {
        const sale = await getSaleById(resumedSaleId);
        if (sale && sale.status === 'draft') {
          setBuyerName(sale.buyerName);
          setCustomerSearch(sale.buyerName);
          setSelectedCustomerId(sale.customerId || null);
          setCart(sale.items);
          setPaidAmount(sale.paidAmount || 0);
          setIsQuotation(false); // drafts are not quotations by default in this flow
        } else if (sale) {
          alert("Only draft orders can be resumed.");
          router.replace("/sales");
        }
      }
    } catch (error) {
      console.error("Error loading sales data:", error);
      alert("Failed to load store data.");
    } finally {
      setIsLoading(false);
    }
  }, [loadCustomers, loadProducts, resumedSaleId, getSaleById, router]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Filtering products for search
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(term) ||
        p.productId.toLowerCase().includes(term)
    );
  }, [searchTerm, products]);

  // Cart Management
  const addToCart = (product: Product, batchId?: string) => {
    if (product.availableQty <= 0) {
      alert("This item is out of stock!");
      return;
    }

    const firstAvailableBatch = product.batches?.find(b => b.availableQty > 0);
    const activeBatchId = firstAvailableBatch?.id;
    const selectedBatch = product.batches?.find(b => b.id === activeBatchId);

    // Determine the selling price vs original price
    const batchPrice = selectedBatch ? selectedBatch.price : product.price;
    const batchDiscountPrice = selectedBatch ? selectedBatch.discountedPrice : product.discountedPrice;
    const itemOriginalPrice = batchPrice;
    const itemPrice = batchDiscountPrice !== undefined && batchDiscountPrice > 0 ? batchDiscountPrice : batchPrice;
    const itemCost = selectedBatch ? selectedBatch.cost : product.cost;

    const itemAvailableQty = selectedBatch ? selectedBatch.availableQty : product.availableQty;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.batchId === activeBatchId);
      if (existing) {
        if (existing.qty >= product.availableQty) {
          alert(`Only ${product.availableQty} units available in total inventory.`);
          return prev;
        }
        return prev.map((item) =>
          (item.id === product.id && item.batchId === activeBatchId) ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [
        ...prev,
        {
          id: product.id!,
          productId: product.productId,
          productName: product.productName,
          price: itemPrice,
          originalPrice: itemPrice !== itemOriginalPrice ? itemOriginalPrice : null,
          cost: itemCost,
          qty: 1,
          batchId: activeBatchId || null,
          batchLabel: selectedBatch?.label || null,
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number, batchId?: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.batchId === batchId) {
            const product = products.find((p) => p.id === id);
            const maxQty = product?.availableQty || 0;

            const newQty = item.qty + delta;

            // Validation
            if (newQty < 1) return null; // Signal removal
            if (newQty > maxQty) {
              alert(`Only ${maxQty} units available in this selection.`);
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeFromCart = (id: string, batchId?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.batchId === batchId)));
  };

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.qty, 0),
    [cart]
  );

  // Default paidAmount to total when items added
  useEffect(() => {
    setPaidAmount(cartTotal);
  }, [cartTotal]);

  const balanceAmount = useMemo(() => Math.max(0, cartTotal - paidAmount), [cartTotal, paidAmount]);

  const derivedStatus = useMemo((): SaleStatus => {
    if (isQuotation) return 'quotation';
    return paidAmount >= cartTotal ? 'completed' : 'pending-payment';
  }, [isQuotation, paidAmount, cartTotal]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const term = customerSearch.toLowerCase();
    return customers.filter(c =>
      c.customerName.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  }, [customerSearch, customers]);

  const selectCustomer = (customer: Customer) => {
    setBuyerName(customer.customerName);
    setSelectedCustomerId(customer.id || null);
    setCustomerSearch(customer.customerName);
    setShowCustomerResults(false);
  };

  const handleCheckout = async () => {
    if (!buyerName.trim()) {
      alert("Please enter the buyer's name.");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    try {
      setIsProcessing(true);
      const saleData: any = {
        buyerName,
        customerId: selectedCustomerId || null,
        items: cart,
        total: cartTotal,
        paidAmount: isQuotation ? 0 : paidAmount,
        balanceAmount: isQuotation ? cartTotal : balanceAmount,
        status: derivedStatus,
      };

      let processedSale;
      if (resumedSaleId) {
        processedSale = await updateSale(resumedSaleId, saleData);
        // Clear the resume param from URL
        router.replace("/sales");
      } else {
        processedSale = await processSale(saleData);
      }

      await refreshProducts();

      // Setup Success Modal
      setLastProcessedSale(processedSale);
      setShowSuccessModal(true);

      // Cleanup Cart UI
      setCart([]);
      setBuyerName("");
      setSelectedCustomerId(null);
      setCustomerSearch("");
      setSearchTerm("");
      setPaidAmount(0);
      setIsQuotation(false);
    } catch (error: any) {
      console.error("Sale processing failed:", error);
      alert(error.message || "Failed to process sale. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!buyerName.trim()) {
      alert("Please enter the buyer's name to save a draft.");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    try {
      setIsProcessing(true);
      const saleData: any = {
        buyerName,
        customerId: selectedCustomerId || null,
        items: cart,
        total: cartTotal,
        paidAmount: 0,
        balanceAmount: cartTotal,
        status: 'draft',
      };

      if (resumedSaleId) {
        await updateSale(resumedSaleId, saleData);
        router.replace("/sales");
      } else {
        await processSale(saleData);
      }

      alert("Order saved as draft!");

      // Cleanup Cart UI
      setCart([]);
      setBuyerName("");
      setSelectedCustomerId(null);
      setCustomerSearch("");
      setSearchTerm("");
      setPaidAmount(0);
      setIsQuotation(false);
    } catch (error: any) {
      console.error("Draft saving failed:", error);
      alert(error.message || "Failed to save draft. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <div className="no-print p-6 mx-auto min-h-[60vh]">


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Search & Selection */}
          <div className="lg:col-span-7 space-y-4">
            {/* <Dropdown placeholder="hi" value={data} onChange={(val)=>setData(val)}/> */}
            {/* Buyer Info */}
            <section className="bg-white  relative z-30">
              <label className="text-[11px] font-bold text-gray-500 block mb-2 flex items-center justify-between gap-2 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-primary-500" />
                  Buyer / Customer Details
                </div>
                {selectedCustomerId && (
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md border border-emerald-100 font-black uppercase tracking-wider">
                    Synced
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customer or enter guest name..."
                  className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-sm font-semibold"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setBuyerName(e.target.value);
                    setSelectedCustomerId(null);
                    setShowCustomerResults(true);
                  }}
                  onFocus={() => setShowCustomerResults(true)}
                />
                {showCustomerResults && filteredCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden p-1">
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="p-3 hover:bg-primary-50 rounded-lg cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-sm text-gray-900">{customer.customerName}</p>
                            <p className="text-[10px] text-gray-400 font-mono italic">{customer.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-primary-500 font-black uppercase tracking-widest">{customer.loyaltyPoints || 0} PTS</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Product Search */}
            <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 min-h-[300px]">
              <label className="text-[11px] font-bold text-gray-500 block mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Search size={14} className="text-primary-500" />
                Catalogue Search
              </label>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-xs font-semibold text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Search Results */}
              <div className="space-y-2">
                {searchTerm && filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/40 transition-all cursor-pointer group"
                      onClick={() => addToCart(p)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">?</div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 group-hover:text-primary-600 transition-colors">
                            {p.productName}
                          </h3>
                          <p className="text-[10px] text-gray-400 font-mono italic">{p.productId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {p.discountedPrice && p.discountedPrice !== p.price ? (
                          <>
                            <p className="text-[10px] text-gray-400 line-through">Rs. {p.price.toLocaleString()}</p>
                            <p className="font-bold text-sm text-primary-600">Rs. {p.discountedPrice.toLocaleString()}</p>
                          </>
                        ) : (
                          <p className="font-bold text-sm text-gray-900">Rs. {p.price.toLocaleString()}</p>
                        )}
                        <p className={`text-[9px] font-black uppercase tracking-wider ${p.availableQty > 5 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {p.availableQty} Unit(s)
                        </p>
                      </div>
                    </div>
                  ))
                ) : searchTerm ? (
                  <div className="py-8 text-center text-gray-400">
                    <p className="text-sm italic">Nothing found for &quot;{searchTerm}&quot;</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                    <Search className="mx-auto mb-2 opacity-15" size={32} />
                    <p className="text-xs font-medium">Type to lookup items...</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Side: Order Summary */}
          <Summary
            cart={cart}
            cartTotal={cartTotal}
            paidAmount={paidAmount}
            setPaidAmount={setPaidAmount}
            isQuotation={isQuotation}
            setIsQuotation={setIsQuotation}
            removeFromCart={removeFromCart}
            updateQty={updateQty}
            handleCheckout={handleCheckout}
            handleSaveDraft={handleSaveDraft}
            isProcessing={isProcessing}
            derivedStatus={derivedStatus}
            balanceAmount={balanceAmount} />
        </div>

        {/* Clean Loader (Within Content) */}
        {isLoading && (
          <div className="absolute inset-0 z-[50] bg-gray-50/80 backdrop-blur-sm flex flex-col items-center justify-center no-print">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
                <ShoppingCart className="absolute inset-0 m-auto text-primary-600 w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-black text-primary-900 uppercase tracking-[0.3em] text-[10px]">Accessing System</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && lastProcessedSale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" />

          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
            <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  {lastProcessedSale.status === 'quotation' ? 'Quotation Issued' : 'Sale Completed'}
                </h2>
                <p className="text-[10px] text-mono text-gray-400 mt-0.5 uppercase tracking-tighter">
                  ID: #{lastProcessedSale.id?.toUpperCase()} • {new Date().toLocaleDateString()}
                </p>
              </div>
              <CloseButton onClick={() => {
                setShowSuccessModal(false);
                setLastProcessedSale(null);
              }} />
            </header>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Customer Info */}
              <section className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-0.5">Customer / Buyer</p>
                    <p className="text-base font-black text-emerald-900">{lastProcessedSale.buyerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-0.5">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-emerald-100 text-emerald-700 border-emerald-200`}>
                    {lastProcessedSale.status === 'completed' ? 'Paid' : lastProcessedSale.status === 'pending-payment' ? 'Unpaid' : 'Offer'}
                  </span>
                </div>
              </section>

              {/* Items List */}
              <section>
                <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ShoppingCart size={14} className="text-gray-400" />
                  Order Summary
                </h3>
                <div className="space-y-2">
                  {lastProcessedSale.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:bg-white transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-md border border-gray-200 flex items-center justify-center font-bold text-gray-400 group-hover:text-primary-600 group-hover:border-primary-200 transition-colors text-xs">
                          {item.qty}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{item.productName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {item.originalPrice && item.originalPrice !== item.price && (
                              <p className="text-[8px] text-gray-400 line-through">Rs. {item.originalPrice.toLocaleString()}</p>
                            )}
                            <p className="text-[9px] text-gray-600 font-medium">Rs. {item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-gray-900 font-black text-xs">
                        Rs. {(item.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="border-t border-dashed border-gray-200 pt-5">
                <div className="flex justify-between items-center px-2">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Net Total</p>
                  <p className="text-2xl font-black text-emerald-600">
                    Rs. {lastProcessedSale.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <footer className="p-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-3">
              <div className="flex gap-2">
                <Button
                  className="!bg-white !text-white !h-10 !rounded-xl !text-[10px] !font-black uppercase tracking-widest border border-gray-200 hover:!bg-gray-100 shadow-sm"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setLastProcessedSale(null);
                  }}
                  leftIcon={<Plus size={14} />}
                >
                  New Sale
                </Button>
                <Button
                  className="!bg-white !text-white !h-10 !rounded-xl !text-[10px] !font-black uppercase tracking-widest border border-gray-200 hover:!bg-gray-100 shadow-sm"
                  onClick={() => router.push("/orders")}
                  leftIcon={<ArrowRight size={14} />}
                >
                  View History
                </Button>
              </div>
              <Button
                variant="primary"
                className="!h-10 !rounded-xl !text-[11px] !font-black uppercase tracking-widest shadow-lg shadow-primary-200"
                onClick={() => window.print()}
                leftIcon={<Printer size={16} />}
              >
                Download PDF / Print
              </Button>
            </footer>
          </div>
        </div>
      )}

      {/* Print-only Container */}
      {lastProcessedSale && (
        <div className="print-only">
          <ReceiptPrint sale={lastProcessedSale} />
        </div>
      )}
    </div>
  );
}
