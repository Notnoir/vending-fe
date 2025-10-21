"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Product } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  disabled?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  disabled = false,
}) => {
  const isAvailable = (product.current_stock ?? 0) > 0;
  const isDisabled = disabled || !isAvailable;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get full image URL
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return "/images/placeholder-product.jpg";

    // If already full URL, return as is
    if (imageUrl.startsWith("http")) return imageUrl;

    // If relative path, add backend URL
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    return `${backendUrl}${imageUrl}`;
  };

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-300 hover:shadow-health-lg border-2 bg-white",
        isDisabled && "opacity-50 cursor-not-allowed border-gray-200",
        !isDisabled && "hover:scale-105 hover:border-blue-400 border-blue-100"
      )}
      onClick={() => !isDisabled && onSelect(product)}
    >
      <CardContent className="p-4">
        {/* Stock indicator */}
        <div className="absolute top-2 right-2 z-10">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold shadow-md",
              isAvailable ? "bg-blue-500 text-white" : "bg-red-500 text-white"
            )}
          >
            {isAvailable ? `${product.current_stock} pcs` : "Habis"}
          </div>
        </div>

        {/* Product Image */}
        <div className="relative h-40 w-full mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-white shadow-inner">
          <Image
            src={getImageUrl(product.image_url)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg">SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg line-clamp-1 text-blue-900">
            {product.name}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="text-2xl font-black text-blue-600">
              {formatPrice(product.final_price ?? product.price)}
            </div>

            {product.slot_number && (
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                Slot {product.slot_number}
              </div>
            )}
          </div>

          <Button
            variant={isAvailable ? "primary" : "secondary"}
            size="md"
            fullWidth
            disabled={isDisabled}
            className={cn(
              "mt-3 font-bold",
              isAvailable && "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {isAvailable ? "Pilih Produk" : "Stok Habis"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
