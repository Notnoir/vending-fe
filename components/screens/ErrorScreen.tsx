"use client";

import React, { useEffect, useCallback } from "react";
import { useVendingStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { XCircle, AlertTriangle, Phone, RefreshCw } from "lucide-react";

const ErrorScreen: React.FC = () => {
  const {
    error,
    selectedProduct,
    currentOrder,
    resetTransaction,
    setCurrentScreen,
  } = useVendingStore();

  const handleBackToHome = useCallback(() => {
    resetTransaction();
  }, [resetTransaction]);

  useEffect(() => {
    // Auto redirect to home after 15 seconds if no action taken
    const timer = setTimeout(() => {
      handleBackToHome();
    }, 15000);

    return () => clearTimeout(timer);
  }, [handleBackToHome]);

  const handleTryAgain = () => {
    // Reset to product selection to try again
    setCurrentScreen("product-detail");
  };

  const getErrorTitle = () => {
    if (error?.includes("stock") || error?.includes("stok")) {
      return "Stok Tidak Tersedia";
    } else if (error?.includes("payment") || error?.includes("pembayaran")) {
      return "Pembayaran Gagal";
    } else if (error?.includes("dispense") || error?.includes("keluar")) {
      return "Produk Gagal Keluar";
    } else {
      return "Terjadi Kesalahan";
    }
  };

  const getErrorDescription = () => {
    if (error?.includes("stock") || error?.includes("stok")) {
      return "Maaf, produk yang Anda pilih sedang tidak tersedia. Silakan pilih produk lain.";
    } else if (error?.includes("payment") || error?.includes("pembayaran")) {
      return "Pembayaran tidak dapat diproses. Jika uang sudah terpotong, dana akan dikembalikan otomatis.";
    } else if (error?.includes("dispense") || error?.includes("keluar")) {
      return "Produk tidak dapat dikeluarkan dari mesin. Dana Anda akan dikembalikan secara otomatis.";
    } else {
      return "Mohon maaf atas ketidaknyamanan ini. Silakan coba lagi atau hubungi petugas.";
    }
  };

  const getRefundInfo = () => {
    if (
      currentOrder &&
      (error?.includes("payment") ||
        error?.includes("dispense") ||
        error?.includes("keluar") ||
        error?.includes("pembayaran"))
    ) {
      return (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            💰 Informasi Pengembalian Dana
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Dana akan dikembalikan otomatis dalam 1-3 hari kerja</p>
            <p>• Pengembalian ke rekening/e-wallet yang sama</p>
            <p>• Order ID: {currentOrder.order_id}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <Card className="border-red-200 shadow-health-lg">
          <CardContent className="p-8 space-y-6">
            {/* Error Icon */}
            <div className="relative">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-md">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>

              {/* Warning indicators */}
              <AlertTriangle className="absolute -top-2 -right-2 h-8 w-8 text-orange-500 fill-current animate-pulse" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-red-800">
                {getErrorTitle()}
              </h1>
              <p className="text-red-700">{getErrorDescription()}</p>
            </div>

            {/* Product Info (if available) */}
            {selectedProduct && (
              <div className="bg-red-50 p-4 rounded-lg space-y-2">
                <div className="font-semibold text-red-800">
                  {selectedProduct.name}
                </div>
                {currentOrder && (
                  <p className="text-sm text-red-700">
                    Order ID: {currentOrder.order_id}
                  </p>
                )}
              </div>
            )}

            {/* Error Details */}
            {error && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-mono">
                  Error: {error}
                </p>
              </div>
            )}

            {/* Refund Information */}
            {getRefundInfo()}

            {/* Instructions */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Apa yang harus dilakukan?
              </h3>
              <div className="text-sm text-yellow-700 space-y-1 text-left">
                <p>1. Periksa area pengambilan produk</p>
                <p>2. Jika produk tidak keluar, hubungi petugas</p>
                <p>3. Simpan screenshot ini sebagai bukti</p>
                <p>4. Dana akan dikembalikan otomatis jika berlaku</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleTryAgain}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>

              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={handleBackToHome}
                className="border border-blue-200 hover:bg-blue-50"
              >
                Kembali ke Beranda
              </Button>
            </div>

            {/* Contact Info */}
            <div className="border-t border-blue-100 pt-4 space-y-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Phone className="h-4 w-4 mr-2" />
                Hubungi Petugas: 0800-1234-5678
              </Button>

              <p className="text-xs text-blue-600">
                Otomatis kembali ke beranda dalam 15 detik
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-700">
            Untuk bantuan lebih lanjut, scan QR code bantuan atau tekan tombol
            Help
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
