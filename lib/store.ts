import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, Order } from "./api";

interface VendingStore {
  // Machine state
  machineId: string;
  isOnline: boolean;

  // Current transaction
  selectedProduct: Product | null;
  quantity: number;
  currentOrder: Order | null;

  // UI state
  currentScreen:
    | "home"
    | "product-detail"
    | "order-summary"
    | "payment"
    | "dispensing"
    | "success"
    | "error";
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedProduct: (product: Product | null) => void;
  setQuantity: (quantity: number) => void;
  setCurrentOrder: (order: Order | null) => void;
  setCurrentScreen: (screen: VendingStore["currentScreen"]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMachineStatus: (online: boolean) => void;

  // Reset transaction
  resetTransaction: () => void;
}

export const useVendingStore = create<VendingStore>()(
  persist(
    (set) => ({
      // Initial state
      machineId: "VM01",
      isOnline: true,
      selectedProduct: null,
      quantity: 1,
      currentOrder: null,
      currentScreen: "home",
      isLoading: false,
      error: null,

      // Actions
      setSelectedProduct: (product) =>
        set({ selectedProduct: product, quantity: 1 }),

      setQuantity: (quantity) =>
        set({ quantity: Math.max(1, Math.min(10, quantity)) }),

      setCurrentOrder: (order) => set({ currentOrder: order }),

      setCurrentScreen: (screen) => set({ currentScreen: screen, error: null }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error, isLoading: false }),

      setMachineStatus: (online) => set({ isOnline: online }),

      resetTransaction: () => {
        // Clear Midtrans token from localStorage when resetting
        const currentOrder = useVendingStore.getState().currentOrder;
        if (currentOrder?.order_id) {
          const storageKey = `midtrans_token_${currentOrder.order_id}`;
          localStorage.removeItem(storageKey);
        }

        set({
          selectedProduct: null,
          quantity: 1,
          currentOrder: null,
          currentScreen: "home",
          error: null,
          isLoading: false,
        });
      },
    }),
    {
      name: "vending-store", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist important transaction data
      partialize: (state) => ({
        selectedProduct: state.selectedProduct,
        quantity: state.quantity,
        currentOrder: state.currentOrder,
        currentScreen: state.currentScreen,
      }),
    }
  )
);
