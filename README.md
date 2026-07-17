# Kepegawaian v2

**Live:** https://pegawai-two.kensetsu.my.id/

Sistem Data Pegawai modern dibangun ulang dengan:

- **Next.js 16** + App Router
- **TypeScript**
- **Drizzle ORM** + migrasi via drizzle-orm/mysql2/migrator
- **Hono** untuk API routes
- **Better Auth** untuk autentikasi & role-based access
- **Tailwind CSS** + **shadcn/ui**
- **MySQL/MariaDB**

## Fitur

- Autentikasi (login, register, logout)
- Role-based access: `admin` (CRUD) dan `staff` (read-only)
- Modul Pegawai (CRUD + soft delete + search + pagination + export CSV)
- Modul Jabatan (CRUD + soft delete + search + pagination + export CSV)
- Modul Penugasan Jabatan (CRUD dengan JOIN + soft delete + search + pagination + export CSV)
- Manajemen User (admin-only): tambah, edit role, hapus user

## Prasyarat

- Node.js 20+
- MySQL 8.0+ atau MariaDB 10.5+
- Docker (opsional, untuk cara 1)

## Kompatibilitas Database

Project ini kompatibel dengan **MySQL 8.0+** dan **MariaDB 10.5+**.

- Semua query menggunakan standard SQL (`SELECT`, `INSERT`, `UPDATE`, `JOIN`, `COUNT`) tanpa `LATERAL JOIN` atau fungsi khusus MariaDB/MySQL.
- Migration menggunakan `DEFAULT (now())` untuk kolom `timestamp`, yang didukung sejak MySQL 8.0.13 dan MariaDB 10.2.3.
- Driver `mysql2` yang digunakan support kedua database.

> **Catatan**: Project ini telah diuji langsung pada MariaDB 10.11. Untuk MySQL 8 native, sesuaikan `DATABASE_URL` di `.env`.

---

## Tutorial Setup

### Cara 1: Docker (Direkomendasikan)

**Prasyarat:** Docker dan docker-compose terinstall.

```bash
# 1. Clone repository
git clone https://github.com/user1907/kepegawaian-2.git
cd kepegawaian-2

# 2. Buat file .env dari contoh
cp .env.example .env

# 3. Jalankan dengan docker-compose
docker-compose up --build
```

Aplikasi akan tersedia di http://localhost:3000 dan database di port host **3307**.

Setelah container berjalan, lakukan migrate dan seed:

```bash
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

### Cara 2: Manual (Lokal)

**Prasyarat:** Node.js 20+ dan MySQL/MariaDB aktif di port 3306.

```bash
# 1. Clone repository
git clone https://github.com/user1907/kepegawaian-2.git
cd kepegawaian-2

# 2. Install dependencies
npm install

# 3. Buat file .env dari contoh
cp .env.example .env
```

Sesuaikan `.env` sesuai konfigurasi database kamu:

```env
DATABASE_URL=mysql://root:root@localhost:3306/kepegawaian
BETTER_AUTH_SECRET=change-me-in-production-to-a-random-string
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 4. Buat database MySQL
mysql -u root -proot -e "CREATE DATABASE kepegawaian CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Jalankan migrasi
npm run db:migrate

# 6. Seed data awal
npm run db:seed

# 7. Jalankan dev server
npm run dev
```

Buka http://localhost:3000 di browser.

---

## Script Penting

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run db:generate  # Generate Drizzle migration
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed data awal
npm run db:studio    # Drizzle Studio
```

## Struktur Proyek

```
app/
  api/[[...route]]/       # Hono API routes
  api/auth/[...all]/      # Better Auth handler
  (pages)/                # UI pages
components/               # React components + shadcn/ui
lib/
  db/                     # Drizzle schema & client
  auth.ts                 # Better Auth config
  auth-client.ts          # Better Auth client
  api-auth.ts             # Hono auth middleware
  validations/            # Zod schemas
scripts/migrate.ts        # Migration script (drizzle-orm/mysql2/migrator)
scripts/seed.ts           # Seed script
proxy.ts                  # Next.js proxy (auth protection)
```

## Catatan Keamanan

- Password di-hash dengan bcrypt via Better Auth.
- Setiap halaman dilindungi oleh `proxy.ts`.
- Operasi tulis (create, update, delete) memerlukan role `admin`.
- Halaman register publik selalu membuat user dengan role `staff`.
- Admin dapat mengelola user lain melalui menu **Users**.
- Hapus user menggunakan hard delete (tidak ada soft delete pada tabel user).
- Jangan menyimpan credential default di production; ubah password setelah login pertama.

## Source Code

- **GitHub:** https://github.com/user1907/kepegawaian-2
