"use client";

import React, { useState, useEffect } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI, Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Loading } from "@/components/ui/Loading";
import { RefreshCw, Wifi, WifiOff, Settings, FileText } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import PrescriptionScanModal from "@/components/PrescriptionScanModal";

const HomeScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  const { setSelectedProduct, setCurrentScreen, isOnline } = useVendingStore();

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">MediVend</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{products.length} items</span>
              </div>
              <button className="flex items-center space-x-1 hover:text-gray-900">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {isOnline ? (
              <div className="flex items-center bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full">
                <Wifi className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold">Online</span>
              </div>
            ) : (
              <div className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full">
                <WifiOff className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold">Offline</span>
              </div>
            )}

            {/* Prescription Scan Button */}
            <button
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="flex px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow"
              title="Scan Resep Dokter"
            >
              <FileText className="h-5 w-5 mr-2" />
              <span className="text-sm font-semibold">Scan Resep</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadProducts}
              disabled={isLoading}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <RefreshCw
                className={`h-5 w-5 text-gray-700 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </button>

            {/* Admin Button */}
            <Link href="/admin">
              <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">
                <Settings className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold">Admin</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
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
            <p className="text-gray-500 mb-6">
              Silakan refresh atau coba lagi nanti
            </p>
            <button
              onClick={loadProducts}
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="animate-fadeIn">
                <ProductCard
                  product={product}
                  onSelect={handleProductSelect}
                  disabled={!isOnline}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer Status */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Last updated: {formatTime(lastUpdate)}</p>
        </div>
      </div>

      {/* Prescription Scan Modal */}
      <PrescriptionScanModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
      />
    </div>
  );
};

export default HomeScreen;
