# Product Management Admin UI - Quick Guide

## 🎯 Fitur Lengkap

Admin UI untuk mengelola produk vending machine dengan upload gambar sudah selesai dibuat!

### ✨ Fitur Utama

1. **Upload Gambar Produk**

   - Drag & drop atau klik untuk upload
   - Preview gambar real-time
   - Validasi ukuran (max 5MB)
   - Validasi tipe file (hanya gambar)

2. **Create Product**

   - Form lengkap dengan validasi
   - Upload gambar saat create
   - Preview gambar sebelum submit

3. **Update Product**

   - Edit semua field produk
   - Ganti gambar (opsional)
   - Preview gambar lama dan baru

4. **Delete Product**

   - Konfirmasi sebelum hapus
   - Auto-delete gambar terkait

5. **Product List**
   - Table view (desktop)
   - Card view (mobile)
   - Preview gambar di list
   - Filter by category & status

## 📁 File Structure

```
frontend/
├── app/
│   └── admin/
│       └── products/
│           └── page.tsx          # Main products management page
├── components/
│   └── admin/
│       ├── ProductForm.tsx       # Form create/edit dengan upload
│       └── ProductList.tsx       # Table/list produk
└── components/
    └── AdminDashboard.tsx        # Updated dengan link ke products
```

## 🚀 Cara Menggunakan

### 1. Start Backend (jika belum running)

```bash
cd backend
npm start
```

Backend akan jalan di `http://localhost:3001`

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend akan jalan di `http://localhost:3000`

### 3. Akses Admin Panel

1. Buka browser: `http://localhost:3000/admin`
2. Login sebagai admin (jika ada auth)
3. Klik tab **"Upload Gambar"** atau tombol **"Kelola Gambar Produk"**
4. Atau langsung ke: `http://localhost:3000/admin/products`

## 📝 Cara Create Product dengan Gambar

1. **Klik "Add New Product"**
2. **Upload gambar:**
   - Klik area upload atau tombol "Upload Image"
   - Pilih gambar dari komputer (max 5MB)
   - Preview muncul otomatis
3. **Isi form:**
   - Product Name (required)
   - Description (optional)
   - Price (required)
   - Category (beverage/snack/food)
   - Active status (checkbox)
4. **Klik "Create Product"**
5. Gambar akan ter-upload ke `backend/uploads/products/`
6. Product muncul di list dengan gambar

## 🖼️ Cara Edit Product & Ganti Gambar

1. **Klik "Edit" pada produk**
2. **Ganti gambar (opsional):**
   - Klik "Change Image"
   - Pilih gambar baru
   - Preview update otomatis
   - Gambar lama akan dihapus saat save
3. **Edit field lain** (nama, harga, dll)
4. **Klik "Update Product"**
5. Gambar lama otomatis terhapus jika upload baru

## 🗑️ Cara Delete Product

1. **Klik "Delete" pada produk**
2. **Konfirmasi delete**
3. Product dan gambarnya **otomatis terhapus** dari server

## 🔍 Navigasi

Ada **2 cara** akses product management:

### Cara 1: Via Admin Dashboard

1. Buka `/admin`
2. Klik tab **"Produk"**
3. Klik tombol **"Kelola Gambar Produk"**

### Cara 2: Direct Link

1. Langsung ke `/admin/products`

## 🎨 UI Features

### Desktop View

- ✅ Table dengan columns: Image, Product, Category, Price, Status, Actions
- ✅ Image preview 64x64px
- ✅ Hover effects
- ✅ Sortable columns (future)

### Mobile View

- ✅ Card layout responsif
- ✅ Image preview 80x80px
- ✅ Touch-friendly buttons
- ✅ Optimized spacing

### Form Features

- ✅ Image preview 160x160px
- ✅ Real-time preview saat upload
- ✅ Drag & drop support (future enhancement)
- ✅ Progress indicator saat upload
- ✅ Error handling dengan alert

## 🔐 Security & Validation

### Frontend Validation

- ✅ Required fields (name, price)
- ✅ File type validation (hanya gambar)
- ✅ File size validation (max 5MB)
- ✅ Number validation (price > 0)

### Backend Validation

- ✅ Multer file filter (image only)
- ✅ File size limit (5MB)
- ✅ File type check
- ✅ Auto-cleanup jika error

## 🌐 API Endpoints Yang Digunakan

### Get Products

```
GET http://localhost:3001/api/products
```

### Create Product

```
POST http://localhost:3001/api/products
Content-Type: multipart/form-data

Body:
- name: string (required)
- description: string
- price: number (required)
- category: string
- is_active: boolean
- image: File (optional)
```

### Update Product

```
PUT http://localhost:3001/api/products/:id
Content-Type: multipart/form-data

Body: (semua optional)
- name: string
- description: string
- price: number
- category: string
- is_active: boolean
- image: File
```

### Delete Product

```
DELETE http://localhost:3001/api/products/:id
```

### Upload Image Only

```
POST http://localhost:3001/api/upload/image
Content-Type: multipart/form-data

Body:
- image: File (required)
```

## 🎯 Next Steps (Optional Enhancements)

### Level 1 - Basic Improvements

- [ ] Add loading spinner saat upload
- [ ] Add success/error toast notifications
- [ ] Add image zoom on click
- [ ] Add drag & drop upload

### Level 2 - Advanced Features

- [ ] Add bulk upload (multiple images)
- [ ] Add image cropper/editor
- [ ] Add image optimization (compress, resize)
- [ ] Add pagination untuk product list

### Level 3 - Pro Features

- [ ] Add image CDN integration
- [ ] Add image gallery/library
- [ ] Add AI-powered image recognition
- [ ] Add analytics (most viewed products)

## 🐛 Troubleshooting

### Problem: Gambar tidak muncul di list

**Solution:**

1. Pastikan backend running
2. Cek image_url di database (harus `/uploads/products/xxx.jpg`)
3. Cek file ada di `backend/uploads/products/`
4. Buka direct URL: `http://localhost:3001/uploads/products/xxx.jpg`

### Problem: Upload gagal

**Solution:**

1. Cek ukuran file (max 5MB)
2. Cek tipe file (harus image)
3. Cek backend console untuk error
4. Cek directory permissions

### Problem: CORS error

**Solution:**

1. Pastikan backend CORS sudah allow frontend origin
2. Cek `server.js` ada `cors()` middleware

### Problem: Image preview tidak muncul

**Solution:**

1. Cek browser console untuk error
2. Pastikan FileReader API supported
3. Try different browser

## 📱 Mobile App Integration

Untuk mobile app (Flutter), gunakan image URL dari API:

```dart
Image.network(
  'http://192.168.100.17:3001${product.imageUrl}',
  fit: BoxFit.cover,
  errorBuilder: (context, error, stackTrace) {
    return Icon(Icons.image_not_supported);
  },
)
```

## 🎉 Selesai!

Sekarang kamu bisa:
✅ Upload gambar produk dari admin panel
✅ Create produk dengan gambar
✅ Edit produk dan ganti gambar
✅ Delete produk (gambar ikut terhapus)
✅ Lihat preview gambar di list

**Happy Managing! 🚀**
