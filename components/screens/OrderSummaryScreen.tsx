"use client";

import React, { useState } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react";
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
        response: (error as any)?.response,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-4"
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            Ringkasan Pesanan
          </h1>
        </div>

        <div className="space-y-6">
          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Detail Pesanan
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Product Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {selectedProduct.description}
                  </p>
                  {selectedProduct.slot_number && (
                    <p className="text-gray-500 text-xs mt-1">
                      Slot {selectedProduct.slot_number}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Qty: {quantity}</p>
                  <p className="font-semibold">{formatPrice(unitPrice)}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Harga per unit:</span>
                  <span>{formatPrice(unitPrice)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Jumlah:</span>
                  <span>{quantity} pcs</span>
                </div>

                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Informasi Kontak (Opsional)
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor WhatsApp/Telepon
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    placeholder="+62 812-3456-7890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Untuk notifikasi status pesanan (opsional)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Metode Pembayaran</h4>
                  <p className="text-sm text-gray-600">QRIS - Scan & Pay</p>
                </div>

                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">Q</span>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">💳</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCreateOrder}
              disabled={isLoading}
              className="h-14"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loading />
                  <span className="ml-2">Memproses...</span>
                </div>
              ) : (
                `Bayar ${formatPrice(totalPrice)}`
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={handleBack}
              disabled={isLoading}
            >
              Ubah Pesanan
            </Button>
          </div>

          {/* Terms */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>Dengan melanjutkan, Anda menyetujui syarat dan ketentuan</p>
            <p>Pembayaran akan expired dalam 15 menit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryScreen;
