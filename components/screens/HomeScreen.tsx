"use client";

import React, { useState, useEffect } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI, Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Vending Machine {machineId}
              </h1>
              <p className="text-gray-600 mt-1">
                Pilih produk yang Anda inginkan
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Offline</span>
                  </div>
                )}
              </div>

              {/* Last Update */}
              <div className="flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  Update: {formatTime(lastUpdate)}
                </span>
              </div>

              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={loadProducts}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="h-24 w-24 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Tidak Ada Produk Tersedia
            </h3>
            <p className="text-gray-500 mb-4">
              Semua produk sedang habis atau mesin dalam maintenance
            </p>
            <Button variant="primary" onClick={loadProducts}>
              Coba Lagi
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleProductSelect}
                disabled={!isOnline}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Tersedia {products.length} produk</span>
              <span>•</span>
              <span>Pembayaran QRIS & Virtual Account</span>
            </div>

            <div className="flex items-center space-x-4">
              <span>Butuh bantuan? Tekan tombol Help</span>
              <Button variant="secondary" size="sm">
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
