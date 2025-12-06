"use client";

import React, { useEffect, useCallback } from "react";
import { useVendingStore } from "@/lib/store";
import { CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Gift, Star } from "lucide-react";

const SuccessScreen: React.FC = () => {
  const {
    selectedProduct,
    currentOrder,
    quantity,
    resetTransaction,
    setCurrentScreen,
  } = useVendingStore();

  const handleBackToHome = useCallback(() => {
    resetTransaction();
  }, [resetTransaction]);

  useEffect(() => {
    // Auto redirect to home after 10 seconds
    const timer = setTimeout(() => {
      handleBackToHome();
    }, 10000);

    return () => clearTimeout(timer);
  }, [handleBackToHome]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!selectedProduct || !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Button variant="primary" onClick={() => setCurrentScreen("home")}>
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="border-gray-200 shadow-md bg-white rounded-3xl p-8 space-y-6">
          <CardContent className="p-0">
            {/* Success Icon */}
            <div className="relative">
              <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-16 w-16 text-sky-600" />
              </div>

              {/* Celebration stars */}
              <Star className="absolute -top-2 -left-2 h-6 w-6 text-sky-400 fill-current animate-pulse" />
              <Star className="absolute -top-2 -right-2 h-4 w-4 text-sky-400 fill-current animate-pulse delay-300" />
              <Star className="absolute -bottom-2 -left-2 h-4 w-4 text-sky-400 fill-current animate-pulse delay-700" />
              <Star className="absolute -bottom-2 -right-2 h-6 w-6 text-sky-400 fill-current animate-pulse delay-500" />
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Berhasil! 🎉</h1>
              <p className="text-gray-700">Produk Anda telah berhasil keluar</p>
            </div>

            {/* Product Info */}
            <div className="bg-gray-50 p-4 rounded-2xl space-y-2 border border-gray-200">
              <div className="flex items-center justify-center space-x-2">
                <Gift className="h-5 w-5 text-gray-700" />
                <span className="font-semibold text-gray-900">
                  {selectedProduct.name}
                </span>
              </div>

              <p className="text-sm text-gray-700 font-medium">
                {quantity} pcs - {formatPrice(currentOrder.total_amount)}
              </p>

              {currentOrder.order_id && (
                <p className="text-xs text-gray-600 font-mono">
                  Order ID: {currentOrder.order_id}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Silakan Ambil Produk Anda
                </h3>
                <p className="text-sm text-gray-700">
                  Periksa area pengambilan di bagian bawah mesin
                </p>
              </div>

              <div className="text-xs text-gray-700 space-y-1">
                <p>• Pastikan semua produk telah diambil</p>
                <p>• Simpan struk digital ini sebagai bukti</p>
                <p>• Terima kasih atas kepercayaan Anda!</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleBackToHome}
              >
                Beli Lagi
              </Button>

              <p className="text-xs text-gray-500">
                Otomatis kembali ke beranda dalam 10 detik
              </p>
            </div>

            {/* Rating */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-700 mb-2 font-medium">
                Bagaimana pengalaman Anda?
              </p>

              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Butuh bantuan? Hubungi petugas atau scan QR code bantuan
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
