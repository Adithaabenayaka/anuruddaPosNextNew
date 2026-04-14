"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Users, UserPlus, Search, Phone, Mail, MapPin, Pencil, Trash2, X } from "lucide-react";
import { Customer, CreateCustomerInput } from "@/src/types/customer";
import { useCustomers } from "@/src/context/CustomersContext";
import GenericTable from "@/src/components/GenericTable";
import Button from "@/src/components/Button";

const INITIAL_FORM_DATA: CreateCustomerInput = {
  customerName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  loyaltyPoints: 0,
};

export default function CustomersPage() {
  const { customers, loading, loadCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCustomerInput>(INITIAL_FORM_DATA);

  const fetchCustomers = useCallback(async () => {
    try {
      await loadCustomers();
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, [loadCustomers]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setFormData({
        customerName: customer.customerName,
        phone: customer.phone,
        email: customer.email || "",
        addressLine1: customer.addressLine1 || "",
        addressLine2: customer.addressLine2 || "",
        loyaltyPoints: customer.loyaltyPoints || 0,
      });
      setEditingId(customer.id || null);
    } else {
      setFormData(INITIAL_FORM_DATA);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_DATA);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await addCustomer(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Failed to save customer details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await deleteCustomer(id);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const sortedCustomers = [...customers].sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    if (!term) return sortedCustomers;
    return sortedCustomers.filter(c =>
      c.customerName.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  }, [searchTerm, customers]);

  const columns = useMemo(() => [
    {
      header: "Customer Name",
      accessor: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 font-bold">
            {customer.customerName.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-gray-900">{customer.customerName}</span>
        </div>
      ),
    },
    {
      header: "Contact Info",
      accessor: (customer: Customer) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone size={12} className="text-gray-400" />
            <span>{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Mail size={12} className="text-gray-400" />
              <span>{customer.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: "Loyalty Points",
      accessor: (customer: Customer) => (
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black inline-block">
          {customer.loyaltyPoints || 0} pts
        </div>
      )
    },
    {
      header: "Registration",
      accessor: (customer: Customer) => (
        <span className="text-xs text-gray-500">
          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(customer)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDelete(customer.id!)}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ], []);

  return (
    <div className="p-6 max-w-7xl mx-auto relative min-h-[60vh]">
      <header className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Customer Database</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Register and manage your store customers</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all w-64 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleOpenModal()}
            leftIcon={<UserPlus size={14} />}
            className="!text-[10px] !px-3 !py-1"
          >
            Add Customer
          </Button>
        </div>
      </header>

      <GenericTable<Customer>
        data={filteredCustomers}
        columns={columns}
        isLoading={loading}
        emptyMessage="No customers found. Register your first customer by clicking the Add Customer button."
        rowKey={(customer) => customer.id || `pending-${Math.random()}`}
        pageSize={10}
      />

      {/* Register/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
            onClick={handleCloseModal}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-200">
            <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Update Customer" : "Register Customer"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-lg">
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-sm">
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Full Name *</label>
                <input
                  required
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Phone Number *</label>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                  placeholder="e.g. +94 77 123 4567"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                  placeholder="e.g. john@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Address Line 1</label>
                  <input
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                    placeholder="e.g. 123 Main St"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Address Line 2</label>
                  <input
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                    placeholder="e.g. Apartment, Suite"
                  />
                </div>
              </div>

              <footer className="pt-4 flex gap-3">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  className="flex-1"
                  isLoading={isSaving}
                >
                  {isSaving ? "Saving..." : editingId ? "Save Changes" : "Register"}
                </Button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Clean Loader (Within Content) */}
      {loading && (
        <div className="absolute inset-0 z-[50] bg-gray-50/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
              <Users className="absolute inset-0 m-auto text-primary-600 w-6 h-6" />
            </div>
            <p className="font-black text-primary-900 uppercase tracking-[0.3em] text-[10px]">Syncing CRM</p>
          </div>
        </div>
      )}
    </div>
  );
}
