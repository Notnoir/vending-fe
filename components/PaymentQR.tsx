"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Order } from "@/lib/api";
import { paymentService, PaymentRequest } from "@/lib/payment";
import toast from "react-hot-toast";

interface PaymentQRProps {
  order: Order;
  onPaymentSuccess: () => void;
  onPaymentTimeout: () => void;
  onClose: () => void;
}

export const PaymentQR: React.FC<PaymentQRProps> = ({
  order,
  onPaymentSuccess,
  onPaymentTimeout,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(true);
  const [qrisUrl, setQrisUrl] = useState<string>("");
  const [midtransOrderId, setMidtransOrderId] = useState<string>("");

  // Generate Midtrans QRIS on component mount
  useEffect(() => {
    generateMidtransQRIS();
  }, []);

  const generateMidtransQRIS = async () => {
    try {
      setIsGeneratingQR(true);
      console.log("🔄 Generating Midtrans QRIS for order:", order.order_id);

      // Create Midtrans payment request
      const orderId = paymentService.generateOrderId();
      setMidtransOrderId(orderId);

      const paymentRequest: PaymentRequest = {
        orderId: orderId,
        amount: order.total_amount,
        customerName: "Customer",
        customerEmail: "customer@example.com",
        items: [
          {
            id: order.order_id,
            price: order.unit_price,
            quantity: order.quantity,
            name: order.product_name,
          },
        ],
      };

      // Create Midtrans transaction for QRIS
      const response = await paymentService.createTransaction(paymentRequest);

      // For QRIS, we use the redirect_url as QR content
      setQrisUrl(response.redirect_url);

      console.log("✅ Midtrans QRIS generated:", response);
      toast.success("QR Code Midtrans berhasil dibuat");
    } catch (error) {
      console.error("❌ Failed to generate Midtrans QRIS:", error);
      toast.error("Gagal membuat QR Code Midtrans");
      // Fallback to order QR string
      setQrisUrl(order.qr_string || order.payment_url);
      setMidtransOrderId(order.order_id);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  useEffect(() => {
    // Calculate time left
    if (!order.expires_at) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(order.expires_at).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const seconds = Math.floor(difference / 1000);
        setTimeLeft(seconds);
      } else {
        setTimeLeft(0);
        onPaymentTimeout();
      }
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [order.expires_at, onPaymentTimeout]);

  // Auto check payment status every 3 seconds
  useEffect(() => {
    if (!midtransOrderId || isGeneratingQR) return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [midtransOrderId, isGeneratingQR]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  // Check payment status via Midtrans API
  const checkPaymentStatus = async () => {
    if (!midtransOrderId || isCheckingPayment) return;

    setIsCheckingPayment(true);
    try {
      console.log("🔍 Checking Midtrans payment status for:", midtransOrderId);

      // Try API route first
      const response = await fetch(`/api/payment/status/${midtransOrderId}`);
      if (response.ok) {
        const status = await response.json();
        console.log("📊 Payment status via API:", status);

        // Handle mock responses for testing
        if (status._mock) {
          console.log("🎭 Received mock payment response");
          // For testing purposes, simulate payment success after 15 seconds
          const now = new Date().getTime();
          const orderTime = new Date(status.transaction_time).getTime();
          const elapsed = (now - orderTime) / 1000;

          if (elapsed > 15) {
            // Simulate success after 15 seconds
            console.log("✅ Mock payment successful!");
            toast.success("Pembayaran Midtrans berhasil! (Simulasi)");
            onPaymentSuccess();
            return;
          }
          return;
        }

        // Handle real Midtrans responses
        if (
          status.transaction_status === "settlement" ||
          status.transaction_status === "capture"
        ) {
          console.log("✅ Midtrans payment successful!");
          toast.success("Pembayaran Midtrans berhasil!");
          onPaymentSuccess();
        } else if (
          status.transaction_status === "deny" ||
          status.transaction_status === "cancel" ||
          status.transaction_status === "expire"
        ) {
          console.log("❌ Midtrans payment failed:", status.transaction_status);
          toast.error("Pembayaran Midtrans gagal atau dibatalkan");
          onPaymentTimeout();
        }
        return;
      }

      // Fallback to payment service if API route fails
      const status = await paymentService.checkPaymentStatus(midtransOrderId);
      console.log("📊 Payment status via service:", status);

      if (
        status.transaction_status === "settlement" ||
        status.transaction_status === "capture"
      ) {
        console.log("✅ Midtrans payment successful!");
        toast.success("Pembayaran Midtrans berhasil!");
        onPaymentSuccess();
      } else if (
        status.transaction_status === "deny" ||
        status.transaction_status === "cancel" ||
        status.transaction_status === "expire"
      ) {
        console.log("❌ Midtrans payment failed:", status.transaction_status);
        toast.error("Pembayaran Midtrans gagal atau dibatalkan");
        onPaymentTimeout();
      }
    } catch (error) {
      console.error("❌ Error checking Midtrans payment status:", error);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleManualCheck = async () => {
    await checkPaymentStatus();
  };

  const handleTestPayment = async () => {
    setIsCheckingPayment(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("🎭 Simulating successful Midtrans payment");
      toast.success("Pembayaran Midtrans simulasi berhasil!");
      onPaymentSuccess();
    } catch (error) {
      console.error("❌ Test payment error:", error);
      toast.error("Simulasi pembayaran gagal");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Pembayaran QRIS Midtrans</CardTitle>
          <p className="text-gray-600">
            Scan QR Code dengan aplikasi mobile banking atau e-wallet
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            {isGeneratingQR ? (
              <div className="flex flex-col items-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600">Membuat QR Code Midtrans...</p>
              </div>
            ) : (
              <QRCode
                value={qrisUrl || order.qr_string || order.payment_url}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
              />
            )}
          </div>

          {/* Midtrans Badge */}
          {qrisUrl && !qrisUrl.includes(order.order_id) && (
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                🔒 Powered by Midtrans
              </span>
            </div>
          )}

          {/* Order Details */}
          <div className="space-y-2 text-center">
            <h3 className="font-semibold text-lg">{order.product_name}</h3>
            <p className="text-gray-600">Jumlah: {order.quantity} pcs</p>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(order.total_amount)}
            </div>
            {midtransOrderId && (
              <p className="text-xs text-gray-500">
                Order ID: {midtransOrderId}
              </p>
            )}
          </div>

          {/* Countdown */}
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-red-600">
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-600">Waktu tersisa</p>
          </div>

          {/* Status */}
          <div className="text-center">
            {isCheckingPayment ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Mengecek pembayaran Midtrans...</span>
              </div>
            ) : (
              <p className="text-gray-600">Menunggu pembayaran...</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Check Payment Status Button */}
            <Button
              variant="primary"
              fullWidth
              onClick={handleManualCheck}
              disabled={isCheckingPayment || isGeneratingQR}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCheckingPayment ? "Memeriksa..." : "Periksa Status Pembayaran"}
            </Button>

            {/* Test Payment Button (for demo) */}
            <Button
              variant="secondary"
              fullWidth
              onClick={handleTestPayment}
              disabled={isCheckingPayment || isGeneratingQR}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCheckingPayment
                ? "Memproses..."
                : "🧪 Test Pembayaran (Demo)"}
            </Button>

            {/* Close Button */}
            <Button
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={isCheckingPayment}
            >
              Tutup
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-semibold">Cara pembayaran:</p>
            <p>1. Buka aplikasi mobile banking atau e-wallet</p>
            <p>2. Pilih menu scan QR Code</p>
            <p>3. Arahkan kamera ke QR Code di atas</p>
            <p>4. Konfirmasi pembayaran Midtrans</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
