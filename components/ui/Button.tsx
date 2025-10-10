"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "danger"
    | "ghost"
    | "mcd"
    | "mcd-yellow";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm hover:shadow-md",

          // Variants
          {
            "bg-gray-200 text-gray-800 hover:bg-gray-300":
              variant === "default",
            // McDonald's Primary Red
            "bg-[#DA291C] text-white hover:bg-[#B71C1C] focus-visible:ring-[#DA291C] shadow-[0_4px_6px_rgba(218,41,28,0.15)]":
              variant === "primary",
            // McDonald's Yellow
            "bg-[#FFC72C] text-[#B71C1C] hover:bg-[#FFDD57] focus-visible:ring-[#FFC72C] font-bold shadow-[0_4px_6px_rgba(255,199,44,0.25)]":
              variant === "mcd-yellow",
            // McDonald's Gradient
            "bg-gradient-to-r from-[#DA291C] to-[#B71C1C] text-white hover:from-[#B71C1C] hover:to-[#8B1515] focus-visible:ring-[#DA291C] shadow-[0_4px_6px_rgba(218,41,28,0.2)]":
              variant === "mcd",
            "bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500":
              variant === "secondary",
            "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500":
              variant === "danger",
            "hover:bg-gray-100 focus-visible:ring-gray-500":
              variant === "ghost",
          },

          // Sizes
          {
            "h-9 px-3 text-sm": size === "sm",
            "h-12 px-4 text-base": size === "md",
            "h-14 px-6 text-lg": size === "lg",
            "h-16 px-8 text-xl": size === "xl",
          },

          // Full width
          {
            "w-full": fullWidth,
          },

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
