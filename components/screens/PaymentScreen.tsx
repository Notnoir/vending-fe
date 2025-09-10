"use client";

import React, { useEffect, useState } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI } from "@/lib/api";
import { paymentService, PaymentRequest } from "@/lib/payment";
import { PaymentQR } from "@/components/PaymentQR";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, CreditCard, QrCode } from "lucide-react";
import toast from "react-hot-toast";

const PaymentScreen: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "qris" | "midtrans" | null
  >(null);

  const {
    currentOrder,
    selectedProduct,
    setCurrentScreen,
    resetTransaction,
    setLoading,
    setError,
  } = useVendingStore();

  // Load Snap.js script on component mount
  useEffect(() => {
    paymentService.loadSnapScript().catch((error) => {
      console.error("Failed to load Snap.js:", error);
    });
  }, []);

  useEffect(() => {
    if (!currentOrder || !selectedProduct) {
      setCurrentScreen("home");
    }
  }, [currentOrder, selectedProduct, setCurrentScreen]);

  if (!currentOrder || !selectedProduct) {
    return <Loading message="Memuat pembayaran..." fullScreen />;
  }

  // Handle Midtrans payment
  const handleMidtransPayment = async () => {
    if (!currentOrder || !selectedProduct) return;

    setIsProcessing(true);

    try {
      // Prepare payment request
      const paymentRequest: PaymentRequest = {
        orderId: currentOrder.order_id,
        amount: paymentService.formatAmount(currentOrder.total_amount),
        customerName: "Vending Machine Customer",
        customerEmail: "customer@vendingmachine.com",
        items: [
          {
            id: selectedProduct.id.toString(),
            price: selectedProduct.price,
            quantity: currentOrder.quantity,
            name: selectedProduct.name,
          },
        ],
      };

      // Create transaction
      const response = await paymentService.createTransaction(paymentRequest);

      // Open Snap payment popup
      const result = await paymentService.openSnapPayment(response.token);

      // Handle payment result
      if (
        result.transaction_status === "settlement" ||
        result.transaction_status === "capture"
      ) {
        await handlePaymentSuccess();
      } else if (result.transaction_status === "pending") {
        toast.success("Pembayaran dalam proses. Silakan tunggu konfirmasi.");
        // You might want to poll for status updates here
      }
    } catch (error) {
      console.error("Midtrans payment error:", error);
      toast.error("Pembayaran gagal. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

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

  const handleTimeout = () => {
    setError("Waktu pembayaran telah habis. Silakan coba lagi.");
    resetTransaction();
    setCurrentScreen("home");
  };

  const handleBackToSummary = () => {
    setCurrentScreen("order-summary");
  };

  // Show payment method selection if no method is chosen
  if (!paymentMethod) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBackToSummary}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              Pilih Metode Pembayaran
            </h1>
          </div>

          {/* Order Summary */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600">
                    Quantity: {currentOrder.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    Rp {currentOrder.total_amount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-4">
            <Card
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => setPaymentMethod("midtrans")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      Kartu Kredit/Debit
                    </h3>
                    <p className="text-gray-600">
                      Visa, Mastercard, Bank Transfer, E-Wallet
                    </p>
                  </div>
                  <div className="text-blue-600 font-medium">→</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-green-500 transition-colors"
              onClick={() => setPaymentMethod("qris")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <QrCode className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">QRIS</h3>
                    <p className="text-gray-600">
                      Scan QR Code dengan aplikasi mobile banking
                    </p>
                  </div>
                  <div className="text-green-600 font-medium">→</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show Midtrans payment
  if (paymentMethod === "midtrans") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPaymentMethod(null)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              Pembayaran Digital
            </h1>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-10 w-10 text-blue-600" />
              </div>

              <h2 className="text-xl font-semibold mb-4">
                Bayar dengan Midtrans
              </h2>
              <p className="text-gray-600 mb-6">
                Klik tombol di bawah untuk membuka halaman pembayaran yang aman
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedProduct.name}</span>
                  <span className="font-bold text-green-600">
                    Rp {currentOrder.total_amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleMidtransPayment}
                disabled={isProcessing}
                variant="primary"
                fullWidth
                className="mb-4"
              >
                {isProcessing ? "Memproses..." : "Bayar Sekarang"}
              </Button>

              <p className="text-sm text-gray-500">
                Powered by Midtrans - Payment Gateway Terpercaya
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show QRIS payment (existing implementation)
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPaymentMethod(null)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Pembayaran QRIS</h1>
        </div>

        <PaymentQR
          order={currentOrder}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentTimeout={handleTimeout}
          onClose={handleBackToSummary}
        />
      </div>
    </div>
  );
};

export default PaymentScreen;
