"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = "md",
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
};

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = "Loading...",
  size = "lg",
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-white bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="text-center bg-white p-8 rounded-2xl shadow-health-lg border border-blue-100">
          <div className="relative">
            <LoadingSpinner
              size={size}
              className="mx-auto mb-4 border-t-blue-600"
            />
            <div className="absolute inset-0 animate-ping opacity-20">
              <LoadingSpinner
                size={size}
                className="mx-auto border-t-blue-400"
              />
            </div>
          </div>
          <p className="text-blue-900 text-lg font-semibold">{message}</p>
          <p className="text-blue-600 text-sm mt-2">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoadingSpinner size={size} className="mb-4 border-t-blue-600" />
      <p className="text-blue-900 font-medium">{message}</p>
    </div>
  );
};

export { Loading, LoadingSpinner };
