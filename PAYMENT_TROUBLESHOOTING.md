# Payment Troubleshooting Guide

## Error: "Failed to create payment transaction"

### Kemungkinan Penyebab dan Solusi

#### 1. Midtrans Server Key Tidak Dikonfigurasi

**Error Message:** `Midtrans server key not configured`

**Solusi:**

1. Periksa file `.env.local`
2. Pastikan `MIDTRANS_SERVER_KEY` sudah diisi dengan key yang valid
3. Untuk sandbox: `SB-Mid-server-xxxxx`
4. Untuk production: `Mid-server-xxxxx`

```bash
# .env.local
MIDTRANS_SERVER_KEY=SB-Mid-server-BKPq7mt7seDmFYS4jEMFyqEB
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-sDJzIOF086-ENIyv
```

#### 2. Order ID Duplikat

**Error Message:** Contains "duplicate"

**Solusi:**

- Setiap transaksi harus memiliki order ID yang unik
- Backend sudah menggenerate order ID otomatis dengan format: `ORD-{timestamp}-{random}`
- Jika error tetap terjadi, pastikan backend menggenerate ID yang berbeda setiap kali

#### 3. Midtrans Package Belum Terinstall

**Error:** Module not found

**Solusi:**

```bash
cd frontend
npm install midtrans-client
```

#### 4. Invalid Amount atau Item Details

**Error Message:** From Midtrans API

**Solusi:**

- Pastikan `gross_amount` adalah angka positif
- Pastikan `items` array tidak kosong
- Pastikan total item prices = gross_amount

#### 5. Network Error

**Error:** Connection refused atau timeout

**Solusi:**

1. Periksa koneksi internet
2. Periksa firewall - pastikan bisa akses ke:
   - Sandbox: `https://api.sandbox.midtrans.com`
   - Production: `https://api.midtrans.com`

## Cara Debug

### 1. Check Console Logs

Buka browser console (F12) dan lihat log:

```
🔄 Creating payment transaction: {...}
📥 Payment creation request: {...}
```

### 2. Check Network Tab

1. Buka DevTools > Network
2. Filter: `/api/payment/create`
3. Periksa Request Payload dan Response

### 3. Check Backend Logs

```bash
cd backend
npm run dev
```

Lihat log untuk webhook dan order creation

### 4. Test Midtrans Directly

Test kredensial Midtrans Anda:

```bash
curl -X POST \
  https://api.sandbox.midtrans.com/v2/charge \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Basic <BASE64_SERVER_KEY>' \
  -d '{
    "payment_type": "qris",
    "transaction_details": {
      "order_id": "test-001",
      "gross_amount": 10000
    }
  }'
```

## Fallback Behavior

Jika Midtrans gagal, sistem akan:

1. Menampilkan pesan error yang jelas
2. Menggunakan QR string dari backend (jika tersedia)
3. Menyediakan tombol "Coba Lagi"
4. Tetap bisa melakukan pembayaran via backend order

## Environment Variables Checklist

✅ `MIDTRANS_SERVER_KEY` - Server key dari Midtrans dashboard  
✅ `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` - Client key dari Midtrans dashboard  
✅ `NEXT_PUBLIC_BASE_URL` - Base URL untuk callback (http://localhost:3000)  
✅ `BACKEND_URL` - URL backend API (http://localhost:3001)

## Testing Payment Flow

### 1. Test QRIS Generation

1. Pilih produk
2. Klik "Bayar"
3. Pilih "QRIS"
4. QR Code harus muncul dalam 2-3 detik

### 2. Test Error Handling

1. Set invalid `MIDTRANS_SERVER_KEY`
2. Coba generate QR
3. Harus muncul error message dan tombol retry

### 3. Test Midtrans Payment

1. Generate valid QR
2. Scan dengan app (GoPay, OVO, dll)
3. Konfirmasi pembayaran
4. Status harus update otomatis

## Common Issues

### QR Code Tidak Muncul

- Periksa console untuk error
- Coba klik tombol "Coba Lagi"
- Periksa kredensial Midtrans

### Status Tidak Update

- Periksa backend running (`npm run dev` di folder backend)
- Periksa webhook configuration
- Periksa frontend webhook route: `/api/payment/webhook`

### Duplicate Order ID

- Restart backend server
- Clear localStorage: `localStorage.clear()`
- Generate order baru

## Support

Jika masih ada masalah:

1. Check Midtrans Dashboard: https://dashboard.sandbox.midtrans.com
2. Check Documentation: https://docs.midtrans.com
3. Contact: support@midtrans.com
