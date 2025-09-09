"use client";

import React, { useEffect, useState } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI } from "@/lib/api";
import PaymentQR from "@/components/PaymentQR";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const PaymentScreen: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    currentOrder,
    selectedProduct,
    setCurrentScreen,
    resetTransaction,
    setLoading,
    setError,
  } = useVendingStore();

  useEffect(() => {
    if (!currentOrder || !selectedProduct) {
      setCurrentScreen("home");
    }
  }, [currentOrder, selectedProduct, setCurrentScreen]);

  if (!currentOrder || !selectedProduct) {
    return <Loading message="Memuat pembayaran..." fullScreen />;
  }

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    setLoading(true);

    try {
      // Verify payment (in real app, this would be automatic via webhook)
      await vendingAPI.verifyPayment(currentOrder.order_id, "SUCCESS");

      // Trigger dispense
      await vendingAPI.triggerDispense(currentOrder.order_id);

      setCurrentScreen("dispensing");
      toast.success("Pembayaran berhasil! Produk sedang dikeluarkan...");
    } catch (error: unknown) {
      console.error("Payment verification failed:", error);
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Gagal memverifikasi pembayaran";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  const handlePaymentTimeout = () => {
    toast.error("Waktu pembayaran habis");
    setError("Waktu pembayaran telah habis. Silakan coba lagi.");
    setTimeout(() => {
      resetTransaction();
    }, 3000);
  };

  const handleCancel = () => {
    resetTransaction();
  };

  const handleBack = () => {
    setCurrentScreen("order-summary");
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
            disabled={isProcessing}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Pembayaran</h1>
        </div>

        {/* Payment QR Component */}
        <PaymentQR
          order={currentOrder}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentTimeout={handlePaymentTimeout}
          onCancel={handleCancel}
        />

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-3">Butuh Bantuan?</h3>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">1.</span>
              <span>
                Pastikan aplikasi mobile banking/e-wallet Anda sudah terbuka
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">2.</span>
              <span>
                Pilih menu &quot;Scan QR&quot; atau &quot;Transfer&quot;
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">3.</span>
              <span>Arahkan kamera ke QR Code di atas</span>
            </div>

            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">4.</span>
              <span>Konfirmasi pembayaran di aplikasi Anda</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tips:</strong> Jika QR Code tidak terbaca, pastikan
              layar bersih dan pencahayaan cukup
            </p>
          </div>
        </div>

        {/* Supported Payment Methods */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <h4 className="font-medium mb-3">Metode Pembayaran yang Didukung</h4>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl mb-1">🏦</div>
              <span className="text-xs text-gray-600">Mobile Banking</span>
            </div>

            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl mb-1">💳</div>
              <span className="text-xs text-gray-600">E-Wallet</span>
            </div>

            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl mb-1">📱</div>
              <span className="text-xs text-gray-600">QRIS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
