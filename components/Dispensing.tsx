"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/Loading";
import { CheckCircle, XCircle, Package, Clock } from "lucide-react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI } from "@/lib/api";

interface DispensingProps {
  productName: string;
  onComplete: (success: boolean) => void;
}

const Dispensing: React.FC<DispensingProps> = ({ productName, onComplete }) => {
  const [stage, setStage] = useState<
    "waiting_payment" | "dispensing" | "checking" | "complete" | "failed"
  >("dispensing");
  const [progress, setProgress] = useState(0);
  const { currentOrder } = useVendingStore();

  const startDispensingProcess = useCallback(() => {
    // Simulate dispensing process
    const stages = [
      { stage: "dispensing" as const, duration: 2000, progress: 0 },
      { stage: "checking" as const, duration: 1500, progress: 70 },
      { stage: "complete" as const, duration: 1000, progress: 100 },
    ];

    let currentStageIndex = 0;
    let stageProgress = 0;

    const interval = setInterval(() => {
      const currentStage = stages[currentStageIndex];
      stageProgress += 5;

      // Update progress based on current stage
      const baseProgress =
        currentStageIndex > 0
          ? (stages
              .slice(0, currentStageIndex)
              .reduce((sum, s) => sum + s.progress, 0) /
              stages.length) *
            100
          : 0;

      const stageProgressPercent =
        (stageProgress / 100) * ((currentStage.progress / stages.length) * 100);
      setProgress(Math.min(100, baseProgress + stageProgressPercent));

      if (stageProgress >= 100) {
        setStage(currentStage.stage);
        stageProgress = 0;
        currentStageIndex++;

        if (currentStageIndex >= stages.length) {
          clearInterval(interval);
          setTimeout(() => {
            // Simulate 90% success rate
            const success = Math.random() > 0.1;
            if (success) {
              onComplete(true);
            } else {
              setStage("failed");
              setTimeout(() => onComplete(false), 2000);
            }
          }, 1000);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    // Check if order is paid or still pending
    const checkOrderStatus = async () => {
      if (!currentOrder) return;

      try {
        const order = await vendingAPI.getOrderStatus(currentOrder.order_id);

        if (order.status === "PENDING") {
          // Payment not confirmed yet, show waiting state
          setStage("waiting_payment");

          // Poll every 5 seconds for status update
          const pollInterval = setInterval(async () => {
            try {
              const updatedOrder = await vendingAPI.getOrderStatus(
                currentOrder.order_id
              );

              if (
                updatedOrder.status === "PAID" ||
                updatedOrder.status === "DISPENSING" ||
                updatedOrder.status === "COMPLETED"
              ) {
                clearInterval(pollInterval);
                // Trigger dispense
                await vendingAPI.triggerDispense(currentOrder.order_id);
                setStage("dispensing");
                startDispensingProcess();
              }
            } catch (error) {
              console.error("Error polling order status:", error);
            }
          }, 5000);

          // Cleanup on unmount
          return () => clearInterval(pollInterval);
        } else if (order.status === "PAID" || order.status === "DISPENSING") {
          // Already paid, start dispensing
          setStage("dispensing");
          startDispensingProcess();
        } else if (order.status === "COMPLETED") {
          // Already completed
          setStage("complete");
          setTimeout(() => onComplete(true), 2000);
        }
      } catch (error) {
        console.error("Error checking order status:", error);
        // If error, assume we should dispense
        setStage("dispensing");
        startDispensingProcess();
      }
    };

    checkOrderStatus();
  }, [currentOrder, onComplete, startDispensingProcess]);

  const getStageIcon = () => {
    switch (stage) {
      case "waiting_payment":
        return <Clock className="h-12 w-12 text-yellow-600 animate-pulse" />;
      case "dispensing":
        return <LoadingSpinner size="lg" />;
      case "checking":
        return <Package className="h-12 w-12 text-[#0066cc] animate-bounce" />;
      case "complete":
        return <CheckCircle className="h-12 w-12 text-blue-600" />;
      case "failed":
        return <XCircle className="h-12 w-12 text-red-600" />;
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case "waiting_payment":
        return "Menunggu konfirmasi pembayaran...";
      case "dispensing":
        return "Mengeluarkan produk...";
      case "checking":
        return "Memeriksa produk keluar...";
      case "complete":
        return "Produk berhasil keluar!";
      case "failed":
        return "Gagal mengeluarkan produk";
    }
  };

  const getStageDescription = () => {
    switch (stage) {
      case "waiting_payment":
        return "Silakan selesaikan pembayaran Anda. Produk akan keluar otomatis setelah pembayaran terkonfirmasi.";
      case "dispensing":
        return "Motor sedang memutar untuk mengeluarkan produk";
      case "checking":
        return "Sensor sedang memastikan produk keluar dengan benar";
      case "complete":
        return "Silakan ambil produk Anda di bawah";
      case "failed":
        return "Mohon hubungi petugas atau coba lagi";
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-blue-200 shadow-health-lg">
        <CardHeader className="text-center bg-gradient-to-b from-blue-50 to-white">
          <CardTitle className="text-blue-900">Mengeluarkan Produk</CardTitle>
          <p className="text-blue-600 font-medium">{productName}</p>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">{getStageIcon()}</div>

          {/* Progress Bar */}
          {stage !== "waiting_payment" && (
            <div className="space-y-2">
              <div className="w-full bg-blue-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#0066cc] to-[#004a99] h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-blue-600 font-semibold">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Status Message */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-blue-900">
              {getStageMessage()}
            </h3>
            <p className="text-gray-600">{getStageDescription()}</p>
          </div>

          {/* Stage Indicators */}
          {stage !== "waiting_payment" && (
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    ["dispensing", "checking", "complete"].includes(stage)
                      ? "bg-[#0066cc] shadow-sm"
                      : "bg-blue-100"
                  }`}
                />
                <span className="text-sm text-blue-700">Dispensing</span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    ["checking", "complete"].includes(stage)
                      ? "bg-[#0066cc] shadow-sm"
                      : "bg-blue-100"
                  }`}
                />
                <span className="text-sm text-blue-700">Checking</span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    stage === "complete"
                      ? "bg-blue-600 shadow-sm"
                      : stage === "failed"
                      ? "bg-red-600 shadow-sm"
                      : "bg-blue-100"
                  }`}
                />
                <span className="text-sm text-blue-700">Complete</span>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {stage === "waiting_payment" && (
            <div className="text-sm text-yellow-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="font-semibold mb-2">Menunggu Pembayaran</p>
              <p>
                Produk akan dikeluarkan otomatis setelah pembayaran Anda
                terkonfirmasi oleh sistem.
              </p>
              <p className="mt-2 text-xs">
                Status: Memeriksa pembayaran setiap 5 detik...
              </p>
            </div>
          )}

          {stage === "dispensing" && (
            <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p>Proses ini biasanya memakan waktu 1-3 detik</p>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <p>Jika masalah berlanjut, silakan hubungi petugas</p>
              <p className="mt-1">Uang Anda akan dikembalikan otomatis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dispensing;
