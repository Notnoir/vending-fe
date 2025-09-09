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

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
        isDisabled && "opacity-50 cursor-not-allowed",
        !isDisabled && "hover:scale-105"
      )}
      onClick={() => !isDisabled && onSelect(product)}
    >
      <CardContent className="p-4">
        {/* Stock indicator */}
        <div className="absolute top-2 right-2 z-10">
          <div
            className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}
          >
            {isAvailable ? `${product.current_stock} pcs` : "Habis"}
          </div>
        </div>

        {/* Product Image */}
        <div className="relative h-32 w-full mb-3">
          <Image
            src={product.image_url || "/images/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>

          <p className="text-gray-600 text-sm line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(product.final_price ?? product.price)}
            </div>

            {product.slot_number && (
              <div className="text-sm text-gray-500">
                Slot {product.slot_number}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            fullWidth
            disabled={isDisabled}
            className="mt-3"
          >
            {isAvailable ? "Pilih Produk" : "Stok Habis"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
