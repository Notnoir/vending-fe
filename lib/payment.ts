import { MIDTRANS_CONFIG } from "./midtrans";

export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
}

export interface PaymentResponse {
  token: string;
  redirect_url: string;
}

export interface PaymentStatus {
  order_id: string;
  status_code: string;
  transaction_status: string;
  fraud_status: string;
  payment_type: string;
  gross_amount: string;
}

class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = MIDTRANS_CONFIG.isProduction
      ? MIDTRANS_CONFIG.productionBaseUrl
      : MIDTRANS_CONFIG.sandboxBaseUrl;
  }

  // Create payment transaction
  async createTransaction(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment transaction");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating payment transaction:", error);
      throw error;
    }
  }

  // Check payment status
  async checkPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`/api/payment/status/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check payment status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking payment status:", error);
      throw error;
    }
  }

  // Generate order ID
  generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ORDER-${timestamp}-${random}`.toUpperCase();
  }

  // Format amount for Midtrans (no decimal places)
  formatAmount(amount: number): number {
    return Math.round(amount);
  }

  // Open Snap payment popup
  async openSnapPayment(
    token: string
  ): Promise<import("midtrans-client").SnapResult> {
    return new Promise((resolve, reject) => {
      if (
        typeof window !== "undefined" &&
        (window as import("midtrans-client").WindowWithSnap).snap
      ) {
        (window as import("midtrans-client").WindowWithSnap).snap!.pay(token, {
          onSuccess: function (result: import("midtrans-client").SnapResult) {
            console.log("Payment success:", result);
            resolve(result);
          },
          onPending: function (result: import("midtrans-client").SnapResult) {
            console.log("Payment pending:", result);
            resolve(result);
          },
          onError: function (result: import("midtrans-client").SnapResult) {
            console.log("Payment error:", result);
            reject(result);
          },
          onClose: function () {
            console.log("Payment popup closed");
            reject(new Error("Payment popup closed"));
          },
        });
      } else {
        reject(new Error("Snap.js not loaded"));
      }
    });
  }

  // Load Snap.js script
  loadSnapScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined") {
        // Check if script is already loaded
        if ((window as import("midtrans-client").WindowWithSnap).snap) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = MIDTRANS_CONFIG.isProduction
          ? MIDTRANS_CONFIG.productionSnapUrl
          : MIDTRANS_CONFIG.sandboxSnapUrl;
        script.setAttribute("data-client-key", MIDTRANS_CONFIG.clientKey);

        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Snap.js"));

        document.head.appendChild(script);
      } else {
        reject(new Error("Window object not available"));
      }
    });
  }
}

export const paymentService = new PaymentService();
