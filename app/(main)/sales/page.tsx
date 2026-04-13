"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, ShoppingCart, User, Plus, CheckCircle2, Printer, ArrowRight, CloudCog } from "lucide-react";
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
import SuccessModal from "@/src/components/payments/sales/SuccessModal";
import Select from "@/src/components/common/Select";
import SearchSelect from "@/src/components/common/SearchSelect";
import CustomerSearchSelect from "@/src/components/common/SearchSelect";
import Input from "@/src/components/common/Input";


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
  const [paidAmount, setPaidAmount] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastProcessedSale, setLastProcessedSale] = useState<Sale | null>(null);
  const searchParams = useSearchParams();
  const resumedSaleId = searchParams.get("resume");
  const { getSaleById, updateSale } = useSales();
  const [showProductResults, setShowProductResults] = useState(false);
  const productRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        productRef.current &&
        !productRef.current.contains(event.target as Node)
      ) {
        setShowProductResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


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
          setPaidAmount(sale.paidAmount?.toString() || "0");
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
          price: itemPrice.toString(),
          originalPrice: itemPrice !== itemOriginalPrice ? itemOriginalPrice : null,
          catalogPrice: itemPrice,
          cost: itemCost,
          qty: 1,
          batchId: activeBatchId || null,
          batchLabel: selectedBatch?.label || null,
        },
      ];
    });
  };

  const updateQty = (id: string, qty: number, batchId?: string) => {
    if (qty < 1) return;

    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.batchId === batchId
          ? { ...item, qty }
          : item
      )
    );
  };

  const updatePrice = (id: string, price: string, batchId?: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id && item.batchId === (batchId || null)) {
          return { ...item, price };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string, batchId?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.batchId === batchId)));
  };

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + (parseFloat(item.price) || 0) * item.qty, 0),
    [cart]
  );

  // Default paidAmount to total when items added
  useEffect(() => {
    setPaidAmount(cartTotal.toString());
  }, [cartTotal]);

  const balanceAmount = useMemo(() => Math.max(0, cartTotal - parseFloat(paidAmount || "0")), [cartTotal, paidAmount]);

  const derivedStatus = useMemo((): SaleStatus => {
    if (isQuotation) return 'quotation';
    return parseFloat(paidAmount || "0") >= cartTotal ? 'completed' : 'pending-payment';
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

    const invalidItems = cart.filter(item => parseFloat(item.price) <= item.cost);
    if (invalidItems.length > 0) {
      alert(`Some items have selling prices below or equal to their cost. Please adjust them before completing the order.`);
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
      setPaidAmount("0");
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

    const invalidItems = cart.filter(item => parseFloat(item.price) <= item.cost);
    if (invalidItems.length > 0) {
      alert(`Some items have selling prices below or equal to their cost. Please adjust them before saving the draft.`);
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
      setPaidAmount("0");
      setIsQuotation(false);
    } catch (error: any) {
      console.error("Draft saving failed:", error);
      alert(error.message || "Failed to save draft. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="relative overflow-y-auto  rounded-lg p-2 md:p-6">
      <div className="no-print mx-auto min-h-[60vh]">


        <div className="flex flex-col gap-6">
          {/* Left Side: Search & Selection */}
          <div className="w-full flex flex-col md:flex-row gap-6">

            {/* Buyer Info */}
            <section className="bg-white w-full md:w-[40%] relative z-40">
              <label className="text-[13px] font-bold text-gray-500 block mb-2 flex items-center justify-between gap-2 tracking-wider">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-primary-500 " />
                  Buyer / Customer Details
                </div>

                {selectedCustomerId ? (
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md border border-emerald-100 font-black uppercase tracking-wider">
                    Synced
                  </span>
                ) : (
                  <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md border border-red-100 font-black uppercase tracking-wider">
                    Not Synced
                  </span>
                )}
              </label>
              <div className="relative">

                <Input
                  type="text"
                  placeholder="Search customer or enter guest name..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setBuyerName(e.target.value);
                    setSelectedCustomerId(null);
                    setShowCustomerResults(true);
                  }}
                  onFocus={() => setShowCustomerResults(true)}></Input>

                {showCustomerResults && filteredCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 
                    bg-white border border-gray-200 rounded-xl shadow-xl 
                    max-h-80 overflow-y-auto p-2">
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
            <section className="bg-white w-full md:w-[60%] flex-1 gap-6 relative z-30">
              <label className="text-[13px] font-bold text-gray-500 block mb-2 flex items-center justify-between gap-2 tracking-wider">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-primary-500 " />
                  Product Search
                </div>
              </label>
              <div className="relative" ref={productRef}>

                <Input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchTerm}
                  leftIcon={<Search size={16} className="text-gray-400" />}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowProductResults(true);
                  }}
                  onFocus={() => setShowProductResults(true)}
                />


                <div className="space-y-2">
                  {showProductResults && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 
                    bg-white border border-gray-200 rounded-xl shadow-xl 
                    max-h-80 overflow-y-auto p-2">
                      {filteredProducts.map((p) => {
                        const isOutOfStock = p.availableQty === 0;

                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (!isOutOfStock) addToCart(p);
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all group
                          ${isOutOfStock
                                ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                : "border-gray-200 hover:border-primary-200 hover:bg-primary-50/40 cursor-pointer"
                              }
                        `}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                                    ?
                                  </div>
                                )}
                              </div>

                              <div>
                                <h3
                                  className={`font-bold text-sm transition-colors ${isOutOfStock
                                    ? "text-gray-400"
                                    : "text-gray-900 group-hover:text-primary-600"
                                    }`}
                                >
                                  {p.productName}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-mono italic">
                                  {p.productId}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              {p.discountedPrice && p.discountedPrice !== p.price ? (
                                <>
                                  <p className="text-[10px] text-gray-400 line-through">
                                    Rs. {p.price.toLocaleString()}
                                  </p>
                                  <p className="font-bold text-sm text-primary-600">
                                    Rs. {p.discountedPrice.toLocaleString()}
                                  </p>
                                </>
                              ) : (
                                <p className="font-bold text-sm text-gray-900">
                                  Rs. {p.price.toLocaleString()}
                                </p>
                              )}

                              <p
                                className={`text-[9px] font-black uppercase tracking-wider ${p.availableQty > 5
                                  ? "text-emerald-500"
                                  : p.availableQty === 0
                                    ? "text-gray-400"
                                    : "text-rose-500"
                                  }`}
                              >
                                {p.availableQty === 0 ? "Out of Stock" : `${p.availableQty} Unit(s)`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  )}
                </div>
              </div>
            </section>

          </div>

          {/* Right Side: Order Summary */}
          <Summary
            cart={cart}
            setCart={setCart}
            cartTotal={cartTotal}
            paidAmount={paidAmount}
            setPaidAmount={setPaidAmount}
            isQuotation={isQuotation}
            setIsQuotation={setIsQuotation}
            removeFromCart={removeFromCart}
            updateQty={updateQty}
            updatePrice={updatePrice}
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
        <SuccessModal
          lastProcessedSale={lastProcessedSale}
          setShowSuccessModal={setShowSuccessModal}
          setLastProcessedSale={setLastProcessedSale}
        />
      )}

      {/* PDF & Print Container */}
      {lastProcessedSale && (
        <div className="pdf-target">
          <ReceiptPrint sale={lastProcessedSale} />
        </div>
      )}
    </div>
  );
}


