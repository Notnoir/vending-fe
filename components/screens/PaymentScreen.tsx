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
      <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] to-white p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="mcd-yellow"
              size="sm"
              onClick={handleBackToSummary}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-[#B71C1C]">
              Pilih Metode Pembayaran
            </h1>
          </div>

          {/* Order Summary */}
          <Card className="mb-6 border-2 border-[#FFC72C]/30">
            <CardContent className="p-6 bg-gradient-to-r from-white to-[#FFF5F5]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#B71C1C]">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600">
                    Jumlah: {currentOrder.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-[#DA291C]">
                    Rp {currentOrder.total_amount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-4">
            <Card
              className="cursor-pointer hover:border-[#DA291C] hover:shadow-xl transition-all duration-200 border-2"
              onClick={() => setPaymentMethod("midtrans")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-[#DA291C] to-[#B71C1C] p-3 rounded-xl shadow-md">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#B71C1C]">
                      Midtrans Payment
                    </h3>
                    <p className="text-gray-600">
                      Visa, Mastercard, Bank Transfer, E-Wallet
                    </p>
                  </div>
                  <div className="text-[#DA291C] font-bold text-xl">→</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-[#00AA13] hover:shadow-xl transition-all duration-200 border-2"
              onClick={() => setPaymentMethod("qris")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-[#00AA13] to-[#008A10] p-3 rounded-xl shadow-md">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#00AA13]">QRIS</h3>
                    <p className="text-gray-600">
                      Scan QR Code dengan aplikasi mobile banking
                    </p>
                  </div>
                  <div className="text-[#00AA13] font-bold text-xl">→</div>
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
      <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] to-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="mcd-yellow"
              size="sm"
              onClick={() => setPaymentMethod(null)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-[#B71C1C]">
              Pembayaran Midtrans
            </h1>
          </div>

          <Card className="border-2 border-[#DA291C]/30">
            <CardContent className="p-8 text-center bg-gradient-to-b from-white to-[#FFF5F5]">
              <div className="bg-gradient-to-br from-[#DA291C] to-[#B71C1C] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CreditCard className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-xl font-bold mb-4 text-[#B71C1C]">
                Bayar dengan Midtrans
              </h2>
              <p className="text-gray-600 mb-6">
                Klik tombol di bawah untuk membuka halaman pembayaran yang aman
              </p>

              <div className="bg-gradient-to-r from-[#FFF5F5] to-white rounded-lg p-4 mb-6 border-2 border-[#FFC72C]/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#B71C1C]">
                    {selectedProduct.name}
                  </span>
                  <span className="font-black text-[#DA291C] text-xl">
                    Rp {currentOrder.total_amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleMidtransPayment}
                disabled={isProcessing}
                variant="mcd"
                fullWidth
                size="lg"
                className="mb-4"
              >
                {isProcessing ? "Memproses..." : "💳 Bayar Sekarang"}
              </Button>

              <p className="text-sm text-gray-500">
                🔒 Powered by Midtrans - Payment Gateway Terpercaya
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show QRIS payment (existing implementation)
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="mcd-yellow"
            size="sm"
            onClick={() => setPaymentMethod(null)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-[#00AA13]">Pembayaran QRIS</h1>
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
