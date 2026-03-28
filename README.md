# 🚀 Auto Portfolio Generator

Auto Portfolio Generator adalah aplikasi *full-stack* berbasis MERN (MongoDB, Express, React, Node.js) yang dapat menyulap repositori dan profil GitHub Anda menjadi *website* portofolio profesional berdesain premium (*Dark Mode & Glassmorphism*) dalam hitungan detik.

## ✨ Fitur Utama

- **GitHub OAuth Integration:** Login instan dan aman menggunakan akun GitHub tanpa perlu membuat *password* baru.
- **Smart Data Fetching:** Mengambil data profil, avatar, dan menyaring repositori secara otomatis menggunakan GitHub API.
- **Auto Tech Stack Extractor:** Mengekstrak bahasa pemrograman yang digunakan dari berbagai repositori menjadi *badge* keahlian.
- **Professional Customization:** Pengguna dapat menambahkan gelar profesional (Job Title) dan tautan LinkedIn.
- **CV View Mode:** Halaman khusus (`/cv`) untuk melihat ringkasan profesional yang siap cetak atau diunduh.
- **Premium UI/UX:** Dibangun menggunakan **Tailwind CSS**, menampilkan desain antarmuka modern dengan efek *Glassmorphism*.
- **Public URL Generation:** Portofolio memiliki URL publik dinamis (`/p/:username`) yang dapat dibagikan ke rekruter.

---

## 🛠️ Tech Stack

**Front-end (Client)**
- React.js (via Vite)
- Tailwind CSS
- React Router DOM
- Axios (HTTP Client)

**Back-end (Server)**
- Node.js & Express.js
- MongoDB & Mongoose (Database)
- Axios (GitHub API calls)
- CORS & Dotenv

**Deployment**
- Netlify (Konfigurasi `netlify.toml` dan `_redirects` sudah tersedia)

---

## ⚙️ Persyaratan Sistem (Prerequisites)

Pastikan Anda memiliki hal berikut sebelum menjalankan aplikasi:
1. [Node.js](https://nodejs.org/) terinstal di mesin Anda.
2. Akun [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) untuk URL koneksi *database*.
3. GitHub OAuth App *credentials* (Dapatkan di GitHub: *Settings* -> *Developer settings* -> *OAuth Apps*).

---

## 🚀 Cara Instalasi & Menjalankan (Local Development)

Proyek ini terbagi menjadi dua direktori utama: `client` dan `server`.

### 1. Setup Server (Back-end)
Buka terminal dan navigasikan ke direktori `server`:

```bash
cd server
npm install
```

Salin file `.env.example` menjadi `.env` dan isi dengan kredensial Anda:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
MONGODB_URI=your_mongodb_connection_string
```

Jalankan *server*:

```bash
npm run dev
```
*(Server akan berjalan di `http://localhost:5000`)*

### 2. Setup Client (Front-end)
Buka terminal baru dan navigasikan ke direktori `client`:

```bash
cd client
npm install
```

Salin file `.env.example` menjadi `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Jalankan React (Vite):

```bash
npm run dev
```
*(Aplikasi web akan berjalan di `http://localhost:5173`)*

---

## 📖 Cara Penggunaan

1. Buka `http://localhost:5173` di *browser*.
2. Klik tombol **"Lanjutkan dengan GitHub"** pada halaman Login.
3. Otorisasi aplikasi di halaman GitHub OAuth.
4. Di halaman **Dashboard**, tinjau data yang ditarik secara otomatis.
5. Isi **Posisi / Keahlian Utama** dan **URL LinkedIn** pada form kustomisasi.
6. Klik **"Publish Sekarang"**.
7. Akses portofolio publik Anda, atau navigasikan ke halaman CV View.

---

## 📂 Struktur Repositori

```text
📦 Portfolio-Generator
 ┣ 📂 client                 # Frontend (Vite + React)
 ┃ ┣ 📂 public               # Static assets & _redirects (Netlify)
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 assets
 ┃ ┃ ┣ 📂 config             # Konfigurasi API
 ┃ ┃ ┣ 📂 pages              # CVView, Dashboard, Login, PublicPortfolio
 ┃ ┃ ┣ 📜 App.jsx            # Routing Utama
 ┃ ┃ ┗ 📜 index.css          # Tailwind Directives
 ┃ ┣ 📜 .env.example
 ┃ ┗ 📜 vite.config.js
 ┣ 📂 server                 # Backend (Node.js + Express)
 ┃ ┣ 📂 controllers          # authController, portfolioController
 ┃ ┣ 📂 models               # Skema Database (Portfolio.js)
 ┃ ┣ 📂 routes               # authRoutes, portfolioRoutes
 ┃ ┣ 📜 .env.example
 ┃ ┗ 📜 index.js             # Entry Point Backend
 ┗ 📜 netlify.toml           # Konfigurasi Deployment Netlify
```

---
*Dibuat untuk mempermudah developer memamerkan karya terbaik mereka.*
