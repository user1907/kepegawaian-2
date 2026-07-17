import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { jabatan } from "@/lib/db/schema";
import { requireAuth, requireAdmin } from "@/lib/api-auth";
import { jabatanSchema, jabatanUpdateSchema } from "@/lib/validations/jabatan";
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

app.get("/", requireAuth, async (c) => {
  const search = c.req.query("search") || "";
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(c.req.query("limit") || "10", 10)));
  const offset = (page - 1) * limit;

  const where = and(
    isNull(jabatan.deletedAt),
    search
      ? or(
          like(jabatan.kodeJabatan, `%${search}%`),
          like(jabatan.namaJabatan, `%${search}%`)
        )
      : undefined,
  );

  const [data, totalResult] = await Promise.all([
    db.query.jabatan.findMany({
      where,
      limit,
      offset,
      orderBy: desc(jabatan.createdAt),
    }),
    db.select({ value: count() }).from(jabatan).where(where),
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

app.post("/", requireAuth, requireAdmin, zValidator("json", jabatanSchema), async (c) => {
  const body = c.req.valid("json");
  const existing = await db.query.jabatan.findFirst({
    where: eq(jabatan.kodeJabatan, body.kodeJabatan),
  });
  if (existing) {
    if (existing.deletedAt) {
      await db
        .update(jabatan)
        .set({
          ...body,
          gaji: String(body.gaji),
          deletedAt: null,
        })
        .where(eq(jabatan.kodeJabatan, body.kodeJabatan));
      return c.json({ message: "Jabatan berhasil dipulihkan" });
    }
    return c.json({ error: "Kode jabatan sudah terdaftar" }, 409);
  }

  await db.insert(jabatan).values({
    ...body,
    gaji: String(body.gaji),
  });
  return c.json({ message: "Jabatan berhasil ditambahkan" }, 201);
});

app.get("/:kode", requireAuth, async (c) => {
  const kode = c.req.param("kode");
  const data = await db.query.jabatan.findFirst({
    where: and(eq(jabatan.kodeJabatan, kode), isNull(jabatan.deletedAt)),
  });
  if (!data) return c.json({ error: "Jabatan tidak ditemukan" }, 404);
  return c.json({ data });
});

app.put("/:kode", requireAuth, requireAdmin, zValidator("json", jabatanUpdateSchema), async (c) => {
  const kode = c.req.param("kode");
  const body = c.req.valid("json");
  const existing = await db.query.jabatan.findFirst({
    where: and(eq(jabatan.kodeJabatan, kode), isNull(jabatan.deletedAt)),
  });
  if (!existing) return c.json({ error: "Jabatan tidak ditemukan" }, 404);

  const updateData = {
    ...body,
    gaji: body.gaji !== undefined ? String(body.gaji) : undefined,
  };
  await db.update(jabatan).set(updateData).where(eq(jabatan.kodeJabatan, kode));
  return c.json({ message: "Jabatan berhasil diperbarui" });
});

app.delete("/:kode", requireAuth, requireAdmin, async (c) => {
  const kode = c.req.param("kode");
  const existing = await db.query.jabatan.findFirst({
    where: and(eq(jabatan.kodeJabatan, kode), isNull(jabatan.deletedAt)),
  });
  if (!existing) return c.json({ error: "Jabatan tidak ditemukan" }, 404);

  await db
    .update(jabatan)
    .set({ deletedAt: sql`now()` })
    .where(eq(jabatan.kodeJabatan, kode));
  return c.json({ message: "Jabatan berhasil dihapus" });
});

app.get("/export/csv", requireAuth, async (c) => {
  const data = await db.query.jabatan.findMany({
    where: isNull(jabatan.deletedAt),
    orderBy: desc(jabatan.namaJabatan),
  });

  const headers = ["Kode Jabatan", "Nama Jabatan", "Level", "Gaji"];
  const rows = data.map((j) => [
    j.kodeJabatan,
    `"${(j.namaJabatan || "").replace(/"/g, '""')}"`,
    String(j.level),
    String(j.gaji),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", "attachment; filename=jabatan.csv");
  return c.body(csv);
});

export default app;
