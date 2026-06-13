# Belajar Vibe Coding - Elysia JS + Drizzle ORM + Bun

Project ini merupakan API sederhana untuk manajemen user yang dibangun menggunakan **Elysia JS** sebagai web framework, **Drizzle ORM** sebagai ORM untuk berinteraksi dengan database **MySQL**, dan dijalankan di atas runtime **Bun**.

---

## 🚀 Teknologi Stack & Library

Berikut adalah teknologi utama dan pustaka yang digunakan dalam proyek ini:

- **Runtime**: [Bun](https://bun.sh/) (v1.3.14) - Runtime JavaScript serba cepat.
- **Web Framework**: [Elysia JS](https://elysiajs.com/) (v1.4.28) - HTTP Framework berkinerja tinggi untuk Bun.
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) (v0.45.2) - ORM modern bertipe data aman (type-safe).
- **Database Driver**: `mysql2` - Driver koneksi untuk MySQL database.
- **Testing Runner**: **Bun Test** - Runner test bawaan dari Bun.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Menjamin penulisan kode dengan type-safety penuh.

---

## 📂 Struktur Folder & Arsitektur Kode

Aplikasi ini menggunakan arsitektur berlapis (layered architecture) yang memisahkan antara routing HTTP (Controller/Routes) dan Logika Bisnis (Service Layer):

```text
belajar-vibe-coding/
├── src/
│   ├── db/
│   │   ├── db.ts          # Inisialisasi koneksi database Drizzle
│   │   └── schema.ts      # Definisi schema database (Tabel users & sessions)
│   ├── routes/
│   │   └── users-route.ts # Routing HTTP menggunakan Elysia JS
│   ├── services/
│   │   └── users-service.ts # Logika bisnis utama aplikasi (Pendaftaran, Login, Logout)
│   └── index.ts           # Entrypoint aplikasi utama
├── tests/
│   └── user.test.ts       # Skenario Unit Testing & Integration Testing
├── .env                   # Konfigurasi variabel lingkungan (Environment Variables)
├── drizzle.config.ts      # Konfigurasi Drizzle Kit untuk database migration
├── package.json           # File konfigurasi npm & scripts
└── tsconfig.json          # Konfigurasi compiler TypeScript
```

### Penamaan File & Aturan Struktur:
- **Routes**: Disimpan di `src/routes/` menggunakan format `*-route.ts` (contoh: `users-route.ts`).
- **Services**: Disimpan di `src/services/` menggunakan format `*-service.ts` (contoh: `users-service.ts`).

---

## 🗄️ Schema Database

Skema tabel didefinisikan menggunakan Drizzle ORM pada file [schema.ts](file:///d:/Belajar/VibeCoding/Tutor%20-%20PZN%20(Programmer%20Zaman%20Now)/GITHUB/belajar-vibe-coding/src/db/schema.ts). Database MySQL terdiri dari 2 tabel:

### 1. Tabel `users`
Menyimpan informasi utama akun pengguna.
- `id` (int, Primary Key, Autoincrement)
- `name` (varchar(255), Not Null)
- `email` (varchar(255), Unique, Not Null)
- `password` (varchar(255), Not Null) - Disimpan dalam bentuk hash bcrypt.
- `created_at` (timestamp, Default: current timestamp)

### 2. Tabel `sessions`
Menyimpan token sesi aktif untuk otentikasi user yang sedang masuk.
- `id` (int, Primary Key, Autoincrement)
- `token` (varchar(255), Not Null) - Berisi UUID token acak.
- `user_id` (int, Foreign Key referencing `users.id`, Not Null)
- `created_at` (timestamp, Default: current timestamp)

---

## 🔌 API Endpoints yang Tersedia

Seluruh route menggunakan prefix `/api` sehingga path diawali dengan `/api/...`.

| Method | Path | Header | Request Body (JSON) | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/users` | - | `{ name, email, password }` | Registrasi user baru |
| **POST** | `/api/users/login` | - | `{ email, password }` | Otentikasi & generate token |
| **GET** | `/api/users/current` | `Authorization: Bearer <token>` | - | Mengambil data user saat ini |
| **DELETE**| `/api/users/logout` | `Authorization: Bearer <token>` | - | Logout & hapus sesi token |

### Aturan Validasi Input (Registrasi):
- `name`: Minimal 1 karakter, Maksimal 255 karakter.
- `email`: Minimal 3 karakter, Maksimal 255 karakter (Format email valid).
- `password`: Minimal 1 karakter, Maksimal 100 karakter.

---

## 🛠️ Cara Setup Project

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer lokal Anda:

### 1. Install Dependencies
Pastikan Anda sudah menginstal [Bun](https://bun.sh/). Jalankan perintah berikut untuk menginstal semua pustaka:
```bash
bun install
```

### 2. Konfigurasi Variabel Lingkungan (`.env`)
Buat file `.env` di root direktori project dan tentukan koneksi MySQL database Anda:
```env
DATABASE_URL=mysql://username:password@127.0.0.1:3306/nama_database
PORT=3000
```

### 3. Migrasi Schema Database
Sinkronisasikan skema database Drizzle Anda dengan database MySQL lokal menggunakan perintah:
```bash
bun run db:push
```

---

## ⚙️ Menjalankan Aplikasi

Aplikasi menyediakan skrip Bun berikut di dalam `package.json`:

- **Mode Development** (dengan hot reload otomatis saat kode berubah):
  ```bash
  bun run dev
  ```

- **Mode Production**:
  ```bash
  bun run start
  ```
  Aplikasi secara default akan berjalan di `http://localhost:3000`.

---

## 🧪 Cara Menjalankan Pengujian (Testing)

Proyek ini telah dilengkapi dengan 21 skenario pengujian komprehensif menggunakan **Bun Test** yang mencakup pengujian sukses, validasi batas input karakter (*maxLength/minLength*), penolakan kredensial salah, dan invalidasi sesi.

Jalankan perintah berikut untuk mengeksekusi semua test:
```bash
bun test
```
*Catatan: Test runner otomatis akan membersihkan data tabel `users` dan `sessions` sebelum setiap skenario dijalankan untuk memastikan isolasi data pengujian.*
