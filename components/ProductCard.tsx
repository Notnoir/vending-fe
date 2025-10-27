"use client";

import React from "react";
import Image from "next/image";
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

  // Get random soft background color like in template
  const getCardBackground = () => {
    const colors = ["bg-white"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden shadow-lg",
        getCardBackground(),
        isDisabled && "opacity-50 cursor-not-allowed",
        !isDisabled && "hover:scale-105 hover:shadow-lg"
      )}
      onClick={() => !isDisabled && onSelect(product)}
    >
      <div className="p-5 relative h-full flex flex-col">
        {/* Product Title & Category */}
        <div className="mb-3">
          <h3 className="font-bold text-xl text-gray-800 mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-600 font-medium">
            {product.description || "Produk Kesehatan"}
          </p>
        </div>

        {/* Product Image - Large centered with fixed size */}
        <div className="relative h-48 w-full mb-4 rounded-2xl overflow-hidden bg-white/30">
          <Image
            src={getImageUrl(product.image_url)}
            alt={product.name}
            fill
            className="object-cover"
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg">HABIS</span>
            </div>
          )}
        </div>

        {/* Price and Cart Button */}
        <div className="mt-auto flex items-center justify-between">
          <div className="text-xl font-black text-gray-800">
            {formatPrice(product.final_price ?? product.price)}
          </div>

          {/* Cart Button - circular like in template */}
          <button
            disabled={isDisabled}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
              isAvailable
                ? "bg-gray-900 hover:bg-gray-800 active:scale-95"
                : "bg-gray-400 cursor-not-allowed"
            )}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>

        {/* Stock badge - top right */}
        {isAvailable && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            {product.current_stock} pcs
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
