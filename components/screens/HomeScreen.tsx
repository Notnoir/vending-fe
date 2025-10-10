"use client";

import React, { useState, useEffect } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI, Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { RefreshCw, Wifi, WifiOff, Clock, Settings } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const HomeScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { setSelectedProduct, setCurrentScreen, isOnline, machineId } =
    useVendingStore();

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await vendingAPI.getAvailableProducts();
      setProducts(response.products);
      setLastUpdate(new Date());
      toast.success("Produk berhasil dimuat");
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Gagal memuat produk");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    // Auto refresh every 5 minutes
    const interval = setInterval(loadProducts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen("product-detail");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <Loading message="Memuat produk..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] to-white p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-[#DA291C] to-[#B71C1C] rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Vending Machine {machineId}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <div className="flex items-center bg-green-500 px-3 py-1 rounded-full">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center bg-red-500 px-3 py-1 rounded-full">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Offline</span>
                  </div>
                )}
              </div>

              {/* Last Update */}
              <div className="flex items-center bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{formatTime(lastUpdate)}</span>
              </div>

              {/* Refresh Button */}
              <Button
                variant="mcd-yellow"
                size="sm"
                onClick={loadProducts}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              {/* Admin Button */}
              <Link href="/admin">
                <Button variant="secondary" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              Tidak Ada Produk Tersedia
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Semua produk sedang habis atau mesin dalam maintenance. Silakan
              coba lagi nanti.
            </p>
            <Button variant="primary" onClick={loadProducts}>
              <RefreshCw className="h-5 w-5 mr-2" />
              Coba Lagi
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="transform transition-all duration-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  product={product}
                  onSelect={handleProductSelect}
                  disabled={!isOnline}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto mt-8 pb-8">
        <div className="bg-gradient-to-r from-white to-[#FFF5F5] rounded-2xl shadow-md p-6 border border-[#FFC72C]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#FFC72C] rounded-full shadow-sm"></div>
                <span className="font-semibold text-[#DA291C]">
                  Tersedia {products.length} produk
                </span>
              </div>
              <span className="text-[#FFC72C]">•</span>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-[#DA291C]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
                <span className="font-medium">Pembayaran QRIS & Midtrans</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-medium">Butuh bantuan?</span>
              <Button variant="mcd" size="sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Help
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
