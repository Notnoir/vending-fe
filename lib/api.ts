import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("machine_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error("API Error Details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      },
    });
    return Promise.reject(error);
  }
);

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  slot_id?: number;
  slot_number?: number;
  current_stock?: number;
  final_price?: number;
}

export interface Order {
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_url: string;
  payment_token: string;
  expires_at: string;
  qr_string: string;
  status: "PENDING" | "PAID" | "DISPENSING" | "COMPLETED" | "FAILED";
  paid_at?: string;
  dispensed_at?: string;
}

export interface DispenseStatus {
  order_id: string;
  status: string;
  success?: boolean;
  drop_detected?: boolean;
  duration_ms?: number;
  error_message?: string;
}

// API functions
export const vendingAPI = {
  // Products
  getAvailableProducts: async (): Promise<{ products: Product[] }> => {
    const response = await api.get("/products/available");
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Orders
  createOrder: async (orderData: {
    slot_id: number;
    quantity?: number;
    customer_phone?: string;
  }): Promise<Order> => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  getOrderStatus: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Payments
  verifyPayment: async (
    orderId: string,
    status: "SUCCESS" | "FAILED" = "SUCCESS"
  ) => {
    const response = await api.post(`/payments/verify/${orderId}`, { status });
    return response.data;
  },

  // Dispense
  triggerDispense: async (orderId: string) => {
    const response = await api.post("/dispense/trigger", { order_id: orderId });
    return response.data;
  },

  getDispenseStatus: async (orderId: string): Promise<DispenseStatus> => {
    const response = await api.get(`/dispense/status/${orderId}`);
    return response.data;
  },

  // Machine
  getMachineInfo: async (machineId: string = "VM01") => {
    const response = await api.get(`/machines/${machineId}`);
    return response.data;
  },

  updateMachineStatus: async (machineId: string = "VM01", status: string) => {
    const response = await api.post(`/machines/${machineId}/status`, {
      status,
    });
    return response.data;
  },
};

export default api;
