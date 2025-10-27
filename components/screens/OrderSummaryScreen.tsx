"use client";

import React, { useState } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ArrowLeft, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

const OrderSummaryScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");

  const {
    selectedProduct,
    quantity,
    setCurrentOrder,
    setCurrentScreen,
    setLoading,
    setError,
  } = useVendingStore();

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Produk tidak ditemukan</p>
          <Button variant="primary" onClick={() => setCurrentScreen("home")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const unitPrice = selectedProduct.final_price ?? selectedProduct.price;
  const totalPrice = unitPrice * quantity;

  const handleBack = () => {
    setCurrentScreen("product-detail");
  };

  const handleCreateOrder = async () => {
    if (!selectedProduct.slot_id) {
      toast.error("Slot produk tidak ditemukan");
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const orderData = {
        slot_id: selectedProduct.slot_id,
        quantity,
        ...(customerPhone && { customer_phone: customerPhone }),
      };

      console.log("Creating order with data:", orderData);
      console.log("Backend URL: http://localhost:3001");

      const order = await vendingAPI.createOrder(orderData);
      console.log("Order created successfully:", order);

      setCurrentOrder(order);
      setCurrentScreen("payment");
      toast.success("Pesanan berhasil dibuat");
    } catch (error: unknown) {
      console.error("Failed to create order:", error);
      console.error("Error details:", {
        name: (error as Error)?.name,
        message: (error as Error)?.message,
        response: (error as { response?: unknown })?.response,
        status: (error as { response?: { status?: number } })?.response?.status,
        data: (error as { response?: { data?: unknown } })?.response?.data,
      });

      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Gagal membuat pesanan";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, "");

    // Format as Indonesian phone number
    if (numbers.startsWith("0")) {
      return numbers.replace(/^0/, "+62 ");
    } else if (numbers.startsWith("62")) {
      return "+" + numbers;
    } else if (numbers.startsWith("8")) {
      return "+62 " + numbers;
    }

    return numbers;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCustomerPhone(formatted);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            disabled={isLoading}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
          <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {quantity}
          </div>
        </div>

        {/* Cart Items - Rounded container */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-md">
          {/* Product Items */}
          <div className="space-y-3 mb-6">
            {Array.from({ length: quantity }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-gray-50 rounded-2xl p-3 border border-gray-200"
              >
                {/* Product Image */}
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <span className="text-2xl">📦</span>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-gray-900 font-semibold">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600 text-xs">
                    {selectedProduct.description || "Produk"}
                  </p>
                </div>

                {/* Price */}
                <div className="bg-gray-900 text-white font-bold px-3 py-1.5 rounded-full text-sm">
                  {formatPrice(unitPrice)}
                </div>
              </div>
            ))}
          </div>

          {/* Tax & Total Card */}
          <div className="bg-gray-100 rounded-2xl p-5 border border-gray-200">
            <div className="relative z-10">
              {/* Tax Amount */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-300">
                <span className="text-gray-700 font-medium text-sm">
                  Tax Amount
                </span>
                <span className="text-gray-900 font-bold">
                  {formatPrice(totalPrice * 0.11)}
                </span>
              </div>

              {/* Total Amount */}
              <div>
                <p className="text-gray-700 font-medium text-sm mb-1">
                  Total Amount
                </p>
                <p className="text-3xl font-black text-gray-900">
                  {formatPrice(totalPrice * 1.11)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info (Optional) */}
        {customerPhone && (
          <div className="bg-white rounded-2xl p-3 mb-4 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 text-gray-900">
              <Smartphone className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">{customerPhone}</span>
            </div>
          </div>
        )}

        {/* Make Payment Button */}
        <button
          onClick={handleCreateOrder}
          disabled={isLoading}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg py-5 rounded-full shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loading />
              <span className="ml-2">Processing...</span>
            </div>
          ) : (
            <>
              <span>Make Payment</span>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </>
          )}
        </button>

        {/* Optional: Phone Input */}
        <div className="mt-4">
          <details className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <summary className="p-3 cursor-pointer text-gray-900 font-medium flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span className="flex items-center space-x-2 text-sm">
                <Smartphone className="h-4 w-4 text-gray-600" />
                <span>Add Contact (Optional)</span>
              </span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="p-3 pt-0 bg-gray-50">
              <input
                type="tel"
                value={customerPhone}
                onChange={handlePhoneChange}
                placeholder="+62 812-3456-7890"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-600 mt-1.5">
                For order status notifications
              </p>
            </div>
          </details>
        </div>

        {/* Terms */}
        <div className="text-xs text-gray-600 text-center mt-4">
          <p>⏱️ Payment will expire in 15 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryScreen;
