"use client";

import React, { useState, useEffect } from "react";
import { vendingAPI, Product } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import ProductModal from "@/components/ui/ProductModal";
import {
  Settings,
  Package,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Download,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  revenue: number;
  lowStockItems: number;
  machineStatus: "online" | "offline" | "maintenance";
}

interface Sale {
  id: number;
  product_name: string;
  quantity: number;
  amount: number;
  payment_method: string;
  transaction_date: string;
  slot_number: string;
}

interface AdminDashboardProps {
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "sales" | "settings"
  >("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    revenue: 0,
    lowStockItems: 0,
    machineStatus: "online",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Handle product save
  const handleProductSave = async (productData: Partial<Product>) => {
    try {
      if (selectedProduct) {
        // Update existing product
        toast.success("Produk berhasil diperbarui");
      } else {
        // Create new product
        toast.success("Produk baru berhasil ditambahkan");
      }

      setShowProductModal(false);
      setSelectedProduct(null);
      loadDashboardData();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Gagal menyimpan produk");
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load products
      const productsResponse = await vendingAPI.getAvailableProducts();
      setProducts(productsResponse.products);

      // Calculate stats
      const totalProducts = productsResponse.products.length;
      const lowStockItems = productsResponse.products.filter(
        (p) => (p.current_stock || 0) <= 5
      ).length;

      setStats({
        totalProducts,
        totalSales: 156, // Mock data - you can implement actual API
        revenue: 2450000, // Mock data
        lowStockItems,
        machineStatus: "online",
      });

      toast.success("Data berhasil dimuat");
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Produk</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Penjualan</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalSales}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendapatan</p>
                <p className="text-3xl font-bold text-gray-900">
                  Rp {stats.revenue.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stok Menipis</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.lowStockItems}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine Status */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status Mesin</h3>
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                stats.machineStatus === "online"
                  ? "bg-green-500"
                  : stats.machineStatus === "offline"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            ></div>
            <span className="text-lg font-medium capitalize">
              {stats.machineStatus}
            </span>
            {stats.machineStatus === "online" && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Peringatan Stok
                </h3>
                <p className="text-red-600">
                  {stats.lowStockItems} produk memiliki stok di bawah 5 unit.
                  Segera lakukan restocking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Products Management View
  const ProductsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manajemen Produk</h2>
        <Button onClick={() => setShowProductModal(true)} variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-600">Slot {product.slot_number}</p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (product.current_stock || 0) > 10
                        ? "bg-green-100 text-green-800"
                        : (product.current_stock || 0) > 5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    Stok: {product.current_stock || 0}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Sales View
  const SalesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Riwayat Penjualan</h2>
        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              Fitur Penjualan
            </h3>
            <p className="text-gray-500">
              Akan segera tersedia untuk melihat riwayat penjualan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Settings View
  const SettingsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pengaturan Sistem</h2>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Pengaturan</h3>
            <p className="text-gray-500">
              Fitur pengaturan akan segera tersedia
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return <Loading message="Memuat dashboard admin..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Vending Machine Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={loadDashboardData} variant="secondary" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {onLogout && (
                <Button onClick={onLogout} variant="secondary" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: "dashboard", name: "Dashboard", icon: BarChart3 },
              { id: "products", name: "Produk", icon: Package },
              { id: "sales", name: "Penjualan", icon: TrendingUp },
              { id: "settings", name: "Pengaturan", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "products" && <ProductsView />}
        {activeTab === "sales" && <SalesView />}
        {activeTab === "settings" && <SettingsView />}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onSave={handleProductSave}
      />
    </div>
  );
};

export default AdminDashboard;
