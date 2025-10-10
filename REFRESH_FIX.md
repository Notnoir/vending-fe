# Fix: Web Payment Status Tidak Persist Saat Refresh

## 🐛 Masalah

Saat user melakukan pembayaran QRIS di web dan refresh halaman, status pembayaran kembali ke "belum terbayar" meskipun pembayaran sudah berhasil.

## 🔍 Root Cause

### Masalah 1: Store Tidak Persist

```typescript
// ❌ OLD: State hilang saat refresh
export const useVendingStore = create<VendingStore>((set) => ({
  currentOrder: null, // Hilang saat refresh!
  selectedProduct: null,
  // ...
}));
```

**Dampak**: Saat refresh, `currentOrder` dan `selectedProduct` menjadi `null`, sehingga tidak bisa cek status pembayaran.

### Masalah 2: Generate Order ID Baru Setiap Mount

```typescript
// ❌ OLD: Generate new order ID setiap component mount
const orderId = paymentService.generateOrderId(); // ORDER-1234
// Saat refresh: ORDER-5678 (BERBEDA!)
```

**Dampak**: Order ID berubah saat refresh, tidak bisa polling status order yang lama.

### Masalah 3: Tidak Cek Status Awal

```typescript
// ❌ OLD: Tidak ada pengecekan status saat mount
useEffect(() => {
  generateMidtransQRIS(); // Generate QR baru
  // Tidak cek apakah order sudah dibayar
}, []);
```

**Dampak**: Meskipun sudah bayar, tidak langsung redirect ke success screen.

## ✅ Solusi Implemented

### 1. Persist Store ke localStorage ✅

```typescript
// ✅ NEW: State persist saat refresh
import { persist, createJSONStorage } from "zustand/middleware";

export const useVendingStore = create<VendingStore>()(
  persist(
    (set) => ({
      currentOrder: null,
      selectedProduct: null,
      // ...
    }),
    {
      name: "vending-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedProduct: state.selectedProduct,
        quantity: state.quantity,
        currentOrder: state.currentOrder,
        currentScreen: state.currentScreen,
      }),
    }
  )
);
```

**Benefit**:

- State tetap ada saat refresh
- User tidak kehilangan progress transaksi

### 2. Gunakan Backend Order ID ✅

```typescript
// ✅ NEW: Use existing order ID from backend
const orderId = order.order_id; // Gunakan order_id dari backend
setMidtransOrderId(orderId);

const paymentRequest: PaymentRequest = {
  orderId: orderId, // Konsisten dengan backend!
  amount: order.total_amount,
  // ...
};
```

**Benefit**:

- Order ID konsisten
- Bisa polling status dengan order ID yang sama
- Backend dan frontend sinkron

### 3. Cek Status Awal Saat Mount ✅

```typescript
// ✅ NEW: Check initial payment status
useEffect(() => {
  const checkInitialStatus = async () => {
    if (!midtransOrderId || isGeneratingQR) return;

    console.log("🔍 Checking initial payment status after mount/refresh...");
    await checkPaymentStatus(); // Cek status saat mount
  };

  const timer = setTimeout(checkInitialStatus, 1000);
  return () => clearTimeout(timer);
}, [midtransOrderId, isGeneratingQR, checkPaymentStatus]);
```

**Benefit**:

- Auto-detect jika sudah bayar
- Langsung redirect ke success jika pembayaran berhasil
- User tidak perlu klik manual

## 🔄 New Flow

### Before Fix:

```
1. User bayar QRIS ✅
2. User refresh page 🔄
3. State hilang ❌
4. Generate order ID baru ❌
5. Polling dengan order ID baru (tidak ditemukan) ❌
6. Status: Belum dibayar ❌
```

### After Fix:

```
1. User bayar QRIS ✅
2. User refresh page 🔄
3. State tetap ada (localStorage) ✅
4. Gunakan order ID yang sama ✅
5. Cek status awal saat mount ✅
6. Detect payment successful ✅
7. Auto redirect ke success! 🎉
```

## 📁 Files Changed

1. ✅ `frontend/lib/store.ts`

   - Add `persist` middleware
   - Store persist ke localStorage
   - Partialize untuk optimize storage

2. ✅ `frontend/components/PaymentQR.tsx`
   - Gunakan `order.order_id` dari backend
   - Add initial status check on mount
   - Auto-detect payment success after refresh

## 🧪 Testing

### Test 1: Normal Payment Flow

1. Pilih produk
2. Create order
3. Scan QR dan bayar
4. ✅ Status berubah ke "Pembayaran Berhasil"
5. Auto dispense

### Test 2: Refresh During Payment

1. Pilih produk
2. Create order
3. QR Code muncul
4. **Refresh halaman** 🔄
5. ✅ QR Code masih sama
6. ✅ Order ID sama
7. Scan QR dan bayar
8. ✅ Status berubah ke "Pembayaran Berhasil"

### Test 3: Refresh After Payment

1. Pilih produk
2. Create order
3. Scan QR dan bayar ✅
4. **Sebelum auto redirect, refresh halaman** 🔄
5. ✅ Auto-check status
6. ✅ Detect payment successful
7. ✅ Auto redirect ke success screen

## 🔍 Debugging

### Check localStorage

```javascript
// Browser console
localStorage.getItem("vending-store");
```

Output should show:

```json
{
  "state": {
    "selectedProduct": {...},
    "quantity": 1,
    "currentOrder": {
      "order_id": "ORD-20241010-ABC123",
      "total_amount": 10000,
      ...
    },
    "currentScreen": "payment"
  },
  "version": 0
}
```

### Check order ID consistency

```javascript
// Browser console - PaymentQR component
console.log("Order ID:", midtransOrderId);
console.log("Backend Order ID:", order.order_id);
// Should be THE SAME!
```

### Check payment status API

```bash
curl http://localhost:3000/api/payment/status/ORD-20241010-ABC123
```

## 🎯 Expected Behavior

### Scenario 1: Fresh Start

- User pilih produk → Order dibuat → QR muncul → User bayar → Success ✅

### Scenario 2: Refresh Before Payment

- User pilih produk → Order dibuat → QR muncul → **Refresh** → QR tetap sama → User bayar → Success ✅

### Scenario 3: Refresh After Payment

- User pilih produk → Order dibuat → QR muncul → User bayar → **Refresh** → Auto-detect paid → Success ✅

### Scenario 4: Close Tab and Reopen

- User pilih produk → Order dibuat → **Close tab** → Open new tab → Navigate to payment → State restored → Continue payment ✅

## ⚠️ Catatan

1. **localStorage limit**: ~5-10MB per domain (cukup untuk store transaction data)
2. **Security**: Jangan store sensitive data (password, payment token) di localStorage
3. **Expiry**: Order tetap ada di localStorage sampai user reset transaction atau clear browser data
4. **Clear storage**: Use `resetTransaction()` untuk clear localStorage

## 🚀 Future Improvements

1. **Add expiry time** ke persisted state
2. **Encrypt sensitive data** di localStorage
3. **Sync with backend** saat mount untuk validasi
4. **Add loading state** saat restore dari localStorage
5. **Handle concurrent tabs** dengan BroadcastChannel API
