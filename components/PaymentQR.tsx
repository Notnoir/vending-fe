"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QrCode, Check, X, Clock, RefreshCw } from "lucide-react";
import { paymentService } from "@/lib/payment";
import toast from "react-hot-toast";

interface PaymentQRProps {
  orderId: string;
  amount: number;
  onSuccess?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
}

const PaymentQR: React.FC<PaymentQRProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
  onClose,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Generate QRIS payment
  const generateMidtransQRIS = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Create payment request
      const paymentRequest = {
        orderId,
        amount: paymentService.formatAmount(amount),
        customerName: "Vending Machine Customer",
        customerEmail: "customer@vendingmachine.com",
        items: [
          {
            id: "vending_item",
            price: amount,
            quantity: 1,
            name: "Vending Machine Item",
          },
        ],
      };

      // Create transaction
      const response = await paymentService.createTransaction(paymentRequest);

      // For QRIS, we need to use the redirect_url as QR code
      setQrCodeUrl(response.redirect_url);

      toast.success("QR Code berhasil dibuat!");

      // Status polling will be handled by useEffect
    } catch (error) {
      console.error("Failed to generate QRIS:", error);
      toast.error("Gagal membuat QR Code");
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, amount, isLoading, onError]);

  // Check payment status
  const checkPaymentStatus = useCallback(async () => {
    if (isCheckingStatus || !orderId) return;

    setIsCheckingStatus(true);
    try {
      const status = await paymentService.checkPaymentStatus(orderId);

      if (
        status.transaction_status === "settlement" ||
        status.transaction_status === "capture"
      ) {
        setPaymentStatus("success");
        toast.success("Pembayaran berhasil!");
        onSuccess?.(status);
      } else if (
        ["cancel", "deny", "expire", "failure"].includes(
          status.transaction_status
        )
      ) {
        setPaymentStatus("failed");
        toast.error("Pembayaran gagal");
        onError?.(status);
      } else if (status.transaction_status === "pending") {
        setPaymentStatus("pending");
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [orderId, isCheckingStatus, onSuccess, onError]);

  // Start polling payment status
  const startStatusPolling = useCallback(() => {
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000); // Check every 5 seconds

    // Auto stop after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);

    return () => clearInterval(interval);
  }, [checkPaymentStatus]);

  // Mock payment for testing
  const simulatePayment = useCallback(async () => {
    setPaymentStatus("processing");
    toast("Simulasi pembayaran...");

    setTimeout(() => {
      setPaymentStatus("success");
      toast.success("Pembayaran berhasil! (Simulasi)");
      onSuccess?.({
        transaction_status: "settlement",
        order_id: orderId,
        payment_type: "qris",
      });
    }, 2000);
  }, [orderId, onSuccess]);

  // Auto-generate QR on mount
  useEffect(() => {
    generateMidtransQRIS();
  }, [generateMidtransQRIS]);

  // Start status polling when QR code is generated
  useEffect(() => {
    if (qrCodeUrl && paymentStatus === "pending") {
      const cleanup = startStatusPolling();
      return cleanup;
    }
  }, [qrCodeUrl, paymentStatus, startStatusPolling]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "success":
        return <Check className="h-8 w-8 text-green-600" />;
      case "failed":
        return <X className="h-8 w-8 text-red-600" />;
      case "processing":
        return <Clock className="h-8 w-8 text-yellow-600" />;
      default:
        return <QrCode className="h-8 w-8 text-blue-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "success":
        return "Pembayaran Berhasil!";
      case "failed":
        return "Pembayaran Gagal";
      case "processing":
        return "Memproses Pembayaran...";
      default:
        return "Scan QR Code untuk Pembayar";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Status Icon */}
          <div className="flex justify-center">{getStatusIcon()}</div>

          {/* Status Message */}
          <h3 className="text-lg font-semibold">{getStatusMessage()}</h3>

          {/* Amount */}
          <p className="text-2xl font-bold text-blue-600">
            Rp {amount.toLocaleString("id-ID")}
          </p>

          {/* QR Code Display */}
          {qrCodeUrl && paymentStatus === "pending" && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center rounded-lg">
                {isLoading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-500">Membuat QR...</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      QR Code akan muncul di sini
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      <a
                        href={qrCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Buka Link Pembayaran
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {paymentStatus === "pending" && !isLoading && (
              <>
                <Button
                  onClick={checkPaymentStatus}
                  disabled={isCheckingStatus}
                  className="w-full"
                  variant="secondary"
                >
                  {isCheckingStatus ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Mengecek Status...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cek Status Pembayaran
                    </>
                  )}
                </Button>

                <Button
                  onClick={simulatePayment}
                  className="w-full"
                  variant="secondary"
                >
                  Simulasi Pembayaran (Testing)
                </Button>
              </>
            )}

            {paymentStatus === "failed" && (
              <Button onClick={generateMidtransQRIS} className="w-full">
                Coba Lagi
              </Button>
            )}

            {(paymentStatus === "success" || paymentStatus === "failed") && (
              <Button onClick={onClose} className="w-full" variant="secondary">
                Tutup
              </Button>
            )}
          </div>

          {/* Order ID */}
          <p className="text-xs text-gray-500">Order ID: {orderId}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentQR;
