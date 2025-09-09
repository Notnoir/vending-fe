"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Order } from "@/lib/api";

interface PaymentQRProps {
  order: Order;
  onPaymentSuccess: () => void;
  onPaymentTimeout: () => void;
  onCancel: () => void;
}

const PaymentQR: React.FC<PaymentQRProps> = ({
  order,
  onPaymentSuccess,
  onPaymentTimeout,
  onCancel,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  useEffect(() => {
    // Calculate time left
    const expiresAt = new Date(order.expires_at).getTime();
    const now = Date.now();
    const initialTimeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

    setTimeLeft(initialTimeLeft);

    if (initialTimeLeft <= 0) {
      onPaymentTimeout();
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onPaymentTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order.expires_at, onPaymentTimeout]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleTestPayment = async () => {
    setIsCheckingPayment(true);
    // Simulate payment check delay
    setTimeout(() => {
      setIsCheckingPayment(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Scan untuk Membayar</CardTitle>
          <p className="text-gray-600">
            Gunakan aplikasi mobile banking atau e-wallet Anda
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <QRCode
              value={order.qr_string}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
          </div>

          {/* Order Details */}
          <div className="space-y-2 text-center">
            <h3 className="font-semibold text-lg">{order.product_name}</h3>
            <p className="text-gray-600">Jumlah: {order.quantity} pcs</p>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(order.total_amount)}
            </div>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Waktu tersisa:</div>
            <div
              className={`text-2xl font-mono font-bold ${
                timeLeft < 60 ? "text-red-600" : "text-green-600"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            {isCheckingPayment ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Mengecek pembayaran...</span>
              </div>
            ) : (
              <p className="text-gray-600">Menunggu pembayaran...</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Test Payment Button (for demo) */}
            <Button
              variant="primary"
              fullWidth
              onClick={handleTestPayment}
              disabled={isCheckingPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCheckingPayment
                ? "Memproses..."
                : "Simulasi Pembayaran (Demo)"}
            </Button>

            <Button
              variant="secondary"
              fullWidth
              onClick={onCancel}
              disabled={isCheckingPayment}
            >
              Batal
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>1. Buka aplikasi mobile banking atau e-wallet</p>
            <p>2. Pilih menu scan QR Code</p>
            <p>3. Arahkan kamera ke QR Code di atas</p>
            <p>4. Konfirmasi pembayaran</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentQR;
