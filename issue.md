# Issue: Implementasi API Get Current User (GET /api/users/current)

## Deskripsi Fitur
Buat endpoint API baru untuk mendapatkan data user yang sedang login saat ini berdasarkan token otentikasi yang dikirim melalui header `Authorization`.

## Spesifikasi API

### 1. Endpoint & Method
- **Method**: `GET`
- **Path**: `/api/users/current`

### 2. Request Header
- **Authorization**: `Bearer <token>` (Token adalah token otentikasi valid yang terdaftar)

### 3. Response Body

#### Response (Success - 200 OK)
Jika token valid dan user ditemukan:
```json
{
  "data": {
    "id": 1,
    "username": "eko",
    "email": "eko@localhost",
    "created_at": "2026-06-13T14:14:17.000Z"
  }
}
```

#### Response (Error - 401 Unauthorized)
Jika token tidak valid, tidak dikirim, atau format tidak sesuai:
```json
{
  "data": "unauthorized"
}
```

---

## Struktur Folder & File
Harap ikuti arsitektur folder yang sudah ada di dalam direktori `src`:
1. **Routes**: Berisi routing Elysia JS.
   - Gunakan atau tambahkan pada file [users-route.ts](file:///d:/Belajar/VibeCoding/Tutor%20-%20PZN%20(Programmer%20Zaman%20Now)/GITHUB/belajar-vibe-coding/src/routes/users-route.ts) (atau buat `user-route.ts` jika ingin memisahkannya).
2. **Services**: Berisi logika bisnis aplikasi.
   - Gunakan atau tambahkan pada file [users-service.ts](file:///d:/Belajar/VibeCoding/Tutor%20-%20PZN%20(Programmer%20Zaman%20Now)/GITHUB/belajar-vibe-coding/src/services/users-service.ts) (atau buat `user-service.ts` jika ingin memisahkannya).

> **Catatan Database (Drizzle ORM):**
> Perhatikan skema database pada [schema.ts](file:///d:/Belajar/VibeCoding/Tutor%20-%20PZN%20(Programmer%20Zaman%20Now)/GITHUB/belajar-vibe-coding/src/db/schema.ts).
> - Token disimpan di dalam tabel `sessions`.
> - Kolom nama di tabel `users` adalah `name` (bukan `username`), namun response API harus memetakan `name` tersebut menjadi `username` sesuai spesifikasi di atas.
> - Kolom tanggal pembuatan user di tabel `users` adalah `createdAt` (dalam TypeScript/Drizzle) yang dipetakan ke `created_at` di MySQL, dan di response API dipetakan menjadi `created_at`.

---

## Tahapan Implementasi

### Langkah 1: Buat Fungsi Bisnis Logic di Service (`users-service.ts`)
1. Buka file [users-service.ts](file:///d:/Belajar/VibeCoding/Tutor%20-%20PZN%20(Programmer%20Zaman%20Now)/GITHUB/belajar-vibe-coding/src/services/users-service.ts).
2. Tambahkan method static baru, misalnya `static async getCurrentUser(token: string)`.
3. Di dalam method tersebut:
   - Cari data session di tabel `sessions` berdasarkan token yang dikirim. Gunakan operator `eq` dari `drizzle-orm` untuk membandingkan `sessions.token`.
   - Jika session tidak ditemukan, throw error (misalnya `new Error("Unauthorized")`).
   - Jika session ditemukan, cari data user di tabel `users` berdasarkan `userId` yang ada di data session tersebut.
   - Jika user tidak ditemukan, throw error.
   - Return objek data user yang sesuai dengan spesifikasi (id, username, email, dan created_at). Lakukan mapping:
     - `username` dari field `user.name`
     - `created_at` dari field `user.createdAt`

### Langkah 2: Buat Endpoint Router di Route (`users-route.ts`)
1. Buka file [users-route.ts](file:///d:/Belajar/VibeCoding/Tutor%20-%20PZN%20(Programmer%20Zaman%20Now)/GITHUB/belajar-vibe-coding/src/routes/users-route.ts).
2. Tambahkan routing baru: `.get("/users/current", async ({ headers, set }) => { ... })`.
3. Di dalam handler routing tersebut:
   - Ambil header `Authorization` dari `headers`.
   - Lakukan pengecekan format token:
     - Pastikan header `Authorization` ada.
     - Pastikan diawali dengan string `"Bearer "`.
     - Ekstrak token aslinya (hapus kata `"Bearer "` dari awal string).
     - Jika tidak ada atau tidak valid formatnya, set `set.status = 401` dan kembalikan `{ data: "unauthorized" }`.
   - Panggil method `UsersService.getCurrentUser(token)` yang telah dibuat di Langkah 1.
   - Jika berhasil (blok `try`), kembalikan response success:
     ```typescript
     return {
       data: {
         id: user.id,
         username: user.username,
         email: user.email,
         created_at: user.created_at
       }
     };
     ```
   - Jika terjadi error (blok `catch`), set `set.status = 401` dan kembalikan `{ data: "unauthorized" }`.

### Langkah 3: Pastikan Route Terdaftar di Aplikasi Utama (`index.ts`)
1. Buka file [index.ts](file:///d:/Belajar/VibeCoding/Tutor%20-%20PZN%20(Programmer%20Zaman%20Now)/GITHUB/belajar-vibe-coding/src/index.ts).
2. Pastikan `usersRoute` sudah di-mount menggunakan `.use(usersRoute)`. (Karena `usersRoute` diprefiks dengan `/api`, path otomatis akan menjadi `/api/users/current`).

---

## Panduan Pengujian (Testing)
Anda dapat menguji fitur ini menggunakan HTTP Client (seperti Postman, Bruno, Talend, atau extension REST Client VSCode) dengan langkah berikut:

1. **Login Terlebih Dahulu**:
   - Lakukan POST ke `/api/users/login` dengan kredensial yang valid.
   - Salin token UUID yang dikembalikan pada response body.

2. **Test Get Current User (Success Case)**:
   - Lakukan GET ke `/api/users/current`.
   - Tambahkan header `Authorization: Bearer <token_dari_langkah_1>`.
   - Verifikasi bahwa response berstatus `200 OK` dan body berisi data user dengan format yang tepat.

3. **Test Get Current User (Error Case - Invalid/No Token)**:
   - Lakukan GET ke `/api/users/current` tanpa header `Authorization` atau dengan token acak.
   - Verifikasi status response adalah `401 Unauthorized` (atau set status 401) dan body berisi `{ "data": "unauthorized" }`.
