"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/Loading";
import { CheckCircle, XCircle, Package } from "lucide-react";

interface DispensingProps {
  productName: string;
  onComplete: (success: boolean) => void;
}

const Dispensing: React.FC<DispensingProps> = ({ productName, onComplete }) => {
  const [stage, setStage] = useState<
    "dispensing" | "checking" | "complete" | "failed"
  >("dispensing");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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

  const getStageIcon = () => {
    switch (stage) {
      case "dispensing":
        return <LoadingSpinner size="lg" />;
      case "checking":
        return <Package className="h-12 w-12 text-blue-600 animate-bounce" />;
      case "complete":
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case "failed":
        return <XCircle className="h-12 w-12 text-red-600" />;
    }
  };

  const getStageMessage = () => {
    switch (stage) {
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
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Mengeluarkan Produk</CardTitle>
          <p className="text-gray-600">{productName}</p>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">{getStageIcon()}</div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{Math.round(progress)}%</p>
          </div>

          {/* Status Message */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{getStageMessage()}</h3>
            <p className="text-gray-600">{getStageDescription()}</p>
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  ["dispensing", "checking", "complete"].includes(stage)
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
              />
              <span className="text-sm">Dispensing</span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  ["checking", "complete"].includes(stage)
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
              />
              <span className="text-sm">Checking</span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  stage === "complete"
                    ? "bg-green-600"
                    : stage === "failed"
                    ? "bg-red-600"
                    : "bg-gray-300"
                }`}
              />
              <span className="text-sm">Complete</span>
            </div>
          </div>

          {/* Additional Info */}
          {stage === "dispensing" && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p>Proses ini biasanya memakan waktu 1-3 detik</p>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
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
