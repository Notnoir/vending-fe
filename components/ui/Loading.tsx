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
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingSpinner size={size} className="mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoadingSpinner size={size} className="mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export { Loading, LoadingSpinner };
