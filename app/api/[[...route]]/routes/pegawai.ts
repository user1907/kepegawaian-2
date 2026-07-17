import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { pegawai } from "@/lib/db/schema";
import { requireAuth, requireAdmin } from "@/lib/api-auth";
import { pegawaiSchema, pegawaiUpdateSchema } from "@/lib/validations/pegawai";
import {
  and,
  or,
  like,
  isNull,
  desc,
  eq,
  count,
  sql,
} from "drizzle-orm";

const app = new Hono();

// List with search & pagination
app.get("/", requireAuth, async (c) => {
  const search = c.req.query("search") || "";
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(c.req.query("limit") || "10", 10)));
  const offset = (page - 1) * limit;

  const where = and(
    isNull(pegawai.deletedAt),
    search
      ? or(
          like(pegawai.nip, `%${search}%`),
          like(pegawai.namaLengkap, `%${search}%`)
        )
      : undefined,
  );

  const [data, totalResult] = await Promise.all([
    db.query.pegawai.findMany({
      where,
      limit,
      offset,
      orderBy: desc(pegawai.createdAt),
    }),
    db.select({ value: count() }).from(pegawai).where(where),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return c.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Create
app.post("/", requireAuth, requireAdmin, zValidator("json", pegawaiSchema), async (c) => {
  const body = c.req.valid("json");
  const existing = await db.query.pegawai.findFirst({
    where: eq(pegawai.nip, body.nip),
  });
  if (existing) {
    if (existing.deletedAt) {
      await db
        .update(pegawai)
        .set({
          ...body,
          tanggalLahir: new Date(body.tanggalLahir),
          deletedAt: null,
        })
        .where(eq(pegawai.nip, body.nip));
      return c.json({ message: "Pegawai berhasil dipulihkan" });
    }
    return c.json({ error: "NIP sudah terdaftar" }, 409);
  }

  await db.insert(pegawai).values({
    ...body,
    tanggalLahir: new Date(body.tanggalLahir),
  });
  return c.json({ message: "Pegawai berhasil ditambahkan" }, 201);
});

// Detail
app.get("/:nip", requireAuth, async (c) => {
  const nip = c.req.param("nip");
  const data = await db.query.pegawai.findFirst({
    where: and(eq(pegawai.nip, nip), isNull(pegawai.deletedAt)),
  });
  if (!data) return c.json({ error: "Pegawai tidak ditemukan" }, 404);
  return c.json({ data });
});

// Update
app.put("/:nip", requireAuth, requireAdmin, zValidator("json", pegawaiUpdateSchema), async (c) => {
  const nip = c.req.param("nip");
  const body = c.req.valid("json");
  const existing = await db.query.pegawai.findFirst({
    where: and(eq(pegawai.nip, nip), isNull(pegawai.deletedAt)),
  });
  if (!existing) return c.json({ error: "Pegawai tidak ditemukan" }, 404);

  const updateData = {
    ...body,
    tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : undefined,
  };
  await db.update(pegawai).set(updateData).where(eq(pegawai.nip, nip));
  return c.json({ message: "Pegawai berhasil diperbarui" });
});

// Soft delete
app.delete("/:nip", requireAuth, requireAdmin, async (c) => {
  const nip = c.req.param("nip");
  const existing = await db.query.pegawai.findFirst({
    where: and(eq(pegawai.nip, nip), isNull(pegawai.deletedAt)),
  });
  if (!existing) return c.json({ error: "Pegawai tidak ditemukan" }, 404);

  await db
    .update(pegawai)
    .set({ deletedAt: sql`now()` })
    .where(eq(pegawai.nip, nip));
  return c.json({ message: "Pegawai berhasil dihapus" });
});

// Export CSV
app.get("/export/csv", requireAuth, async (c) => {
  const data = await db.query.pegawai.findMany({
    where: isNull(pegawai.deletedAt),
    orderBy: desc(pegawai.namaLengkap),
  });

  const headers = ["NIP", "Nama Lengkap", "Jenis Kelamin", "Tanggal Lahir", "Alamat", "No HP", "Email"];
  const rows = data.map((p) => [
    p.nip,
    `"${(p.namaLengkap || "").replace(/"/g, '""')}"`,
    p.jenisKelamin,
    typeof p.tanggalLahir === "string" ? p.tanggalLahir : p.tanggalLahir.toISOString().split("T")[0],
    `"${(p.alamat || "").replace(/"/g, '""')}"`,
    p.noHp,
    p.email,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", "attachment; filename=pegawai.csv");
  return c.body(csv);
});

export default app;
