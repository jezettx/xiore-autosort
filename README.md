# Xiore Autosort 🚀

Xiore Autosort adalah web app internal untuk **mengelola data penyewaan cosplay Xiore Cosrent**  
dengan alur terstruktur dari **input → konfirmasi → database → Excel otomatis**.

Proyek ini dibangun untuk mengurangi input manual, mencegah data tercecer,
dan memastikan **database sebagai source of truth** 📦.


## ✨ Fitur Utama

- 📝 **Form Input & Confirm**
  - Input data penyewa via web
  - Halaman konfirmasi sebelum simpan

- 🗄️ **Database Integration (Neon Postgres)**
  - Data disimpan terstruktur ke tabel `rentals`
  - Validasi field wajib sebelum insert

- 📊 **Excel Auto Sync (Microsoft Graph)**
  - Data otomatis dikirim ke Excel Table
  - Status sinkronisasi: `pending`, `synced`, `failed`

- 🔌 **API Modular**
  - `/api/save` – simpan data utama
  - `/api/excel/send` – kirim ke Excel
  - `/api/excel/status` – cek status sync
  - `/api/excel/test` – testing koneksi Excel


## 🧠 Arsitektur Singkat

- **DB = source of truth**
- **Excel = reporting / mirror**
- Proses save **tidak diblok** oleh Excel sync
- Siap dijalankan di **local** maupun **production (Vercel)** ⚡


## 🛠️ Tech Stack

- Next.js (App Router)
- TypeScript
- Neon Postgres
- Microsoft Graph API
- Tailwind CSS


## ▶️ Menjalankan Project

```bash
npm install
npm run dev
