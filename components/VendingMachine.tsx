"use client";

import React from "react";
import { useVendingStore } from "@/lib/store";
import HomeScreen from "./screens/HomeScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import OrderSummaryScreen from "./screens/OrderSummaryScreen";
import PaymentScreen from "./screens/PaymentScreen";
import DispensingScreen from "./screens/DispensingScreen";
import SuccessScreen from "./screens/SuccessScreen";
import ErrorScreen from "./screens/ErrorScreen";
import { Loading } from "./ui/Loading";

const VendingMachine: React.FC = () => {
  const { currentScreen, isLoading, error } = useVendingStore();

  // Show full screen loading overlay
  if (isLoading) {
    return <Loading message="Memproses..." fullScreen />;
  }

  // Show error screen if there's an error
  if (error && currentScreen !== "error") {
    return <ErrorScreen />;
  }

  // Render appropriate screen based on current state
  switch (currentScreen) {
    case "home":
      return <HomeScreen />;

    case "product-detail":
      return <ProductDetailScreen />;

    case "order-summary":
      return <OrderSummaryScreen />;

    case "payment":
      return <PaymentScreen />;

    case "dispensing":
      return <DispensingScreen />;

    case "success":
      return <SuccessScreen />;

    case "error":
      return <ErrorScreen />;

    default:
      return <HomeScreen />;
  }
};

export default VendingMachine;
