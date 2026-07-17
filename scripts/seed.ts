import { db } from "../lib/db";
import { pegawai, jabatan, jabatanPegawai, user } from "../lib/db/schema";
import { auth } from "../lib/auth";
import { eq } from "drizzle-orm";

async function seed() {
  // Create admin user
  const adminEmail = "admin@example.com";
  const existingAdmin = await db.query.user.findFirst({
    where: eq(user.email, adminEmail),
  });

  if (!existingAdmin) {
    await auth.api.signUpEmail({
      body: {
        name: "Administrator",
        email: adminEmail,
        password: "admin123",
        role: "admin",
      },
    });
    console.log("Admin user created: admin@example.com / admin123");
  }

  // Create staff user
  const staffEmail = "staff@example.com";
  const existingStaff = await db.query.user.findFirst({
    where: eq(user.email, staffEmail),
  });

  if (!existingStaff) {
    await auth.api.signUpEmail({
      body: {
        name: "Staff",
        email: staffEmail,
        password: "staff123",
        role: "staff",
      },
    });
    console.log("Staff user created: staff@example.com / staff123");
  }

  // Seed pegawai
  const pegawaiData = [
    { nip: "10110001", namaLengkap: "Budi Santoso", jenisKelamin: "L" as const, tanggalLahir: "1990-05-15", alamat: "Jl. Merdeka No. 10, Bandung", noHp: "081234567890", email: "budi.santoso@email.com" },
    { nip: "10110002", namaLengkap: "Siti Rahayu", jenisKelamin: "P" as const, tanggalLahir: "1992-08-20", alamat: "Jl. Asia Afrika No. 25, Bandung", noHp: "081234567891", email: "siti.rahayu@email.com" },
    { nip: "10110003", namaLengkap: "Andi Wijaya", jenisKelamin: "L" as const, tanggalLahir: "1988-03-10", alamat: "Jl. Dago No. 50, Bandung", noHp: "081234567892", email: "andi.wijaya@email.com" },
    { nip: "10110004", namaLengkap: "Dewi Lestari", jenisKelamin: "P" as const, tanggalLahir: "1995-11-25", alamat: "Jl. Buah Batu No. 15, Bandung", noHp: "081234567893", email: "dewi.lestari@email.com" },
    { nip: "10110005", namaLengkap: "Rudi Hermawan", jenisKelamin: "L" as const, tanggalLahir: "1987-07-01", alamat: "Jl. Setiabudhi No. 30, Bandung", noHp: "081234567894", email: "rudi.hermawan@email.com" },
    { nip: "10110006", namaLengkap: "Maya Putri", jenisKelamin: "P" as const, tanggalLahir: "1993-01-12", alamat: "Jl. Riau No. 45, Bandung", noHp: "081234567895", email: "maya.putri@email.com" },
    { nip: "10110007", namaLengkap: "Hendra Kurniawan", jenisKelamin: "L" as const, tanggalLahir: "1991-09-08", alamat: "Jl. Cendana No. 20, Bandung", noHp: "081234567896", email: "hendra.kurniawan@email.com" },
    { nip: "10110008", namaLengkap: "Rina Marlina", jenisKelamin: "P" as const, tanggalLahir: "1994-06-18", alamat: "Jl. Gatot Subroto No. 12, Bandung", noHp: "081234567897", email: "rina.marlina@email.com" },
  ];

  for (const p of pegawaiData) {
    const existing = await db.query.pegawai.findFirst({ where: eq(pegawai.nip, p.nip) });
    if (!existing) {
      await db.insert(pegawai).values({ ...p, tanggalLahir: new Date(p.tanggalLahir) });
    }
  }
  console.log("Pegawai seeded");

  // Seed jabatan
  const jabatanData = [
    { kodeJabatan: "J001", namaJabatan: "Kepala Divisi", level: 1, gaji: "15000000.00" },
    { kodeJabatan: "J002", namaJabatan: "Manager", level: 2, gaji: "10000000.00" },
    { kodeJabatan: "J003", namaJabatan: "Supervisor", level: 3, gaji: "7500000.00" },
    { kodeJabatan: "J004", namaJabatan: "Staff Senior", level: 4, gaji: "5500000.00" },
    { kodeJabatan: "J005", namaJabatan: "Staff", level: 5, gaji: "4500000.00" },
  ];

  for (const j of jabatanData) {
    const existing = await db.query.jabatan.findFirst({ where: eq(jabatan.kodeJabatan, j.kodeJabatan) });
    if (!existing) {
      await db.insert(jabatan).values(j);
    }
  }
  console.log("Jabatan seeded");

  // Seed jabatan pegawai
  const jpData = [
    { nip: "10110001", kodeJabatan: "J001", status: "Aktif" as const, periode: "2024-2026" },
    { nip: "10110002", kodeJabatan: "J002", status: "Aktif" as const, periode: "2024-2026" },
    { nip: "10110003", kodeJabatan: "J003", status: "Aktif" as const, periode: "2024-2026" },
    { nip: "10110004", kodeJabatan: "J005", status: "Aktif" as const, periode: "2024-2026" },
    { nip: "10110005", kodeJabatan: "J004", status: "Aktif" as const, periode: "2023-2025" },
    { nip: "10110006", kodeJabatan: "J005", status: "Nonaktif" as const, periode: "2023-2024" },
    { nip: "10110007", kodeJabatan: "J002", status: "Aktif" as const, periode: "2025-2027" },
    { nip: "10110008", kodeJabatan: "J003", status: "Aktif" as const, periode: "2024-2026" },
  ];

  for (const jp of jpData) {
    const existing = await db.query.jabatanPegawai.findFirst({
      where: eq(jabatanPegawai.id, jpData.indexOf(jp) + 1),
    });
    if (!existing) {
      await db.insert(jabatanPegawai).values(jp);
    }
  }
  console.log("Jabatan Pegawai seeded");

  console.log("Seed completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
