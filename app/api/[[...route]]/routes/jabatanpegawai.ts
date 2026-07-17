import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { jabatanPegawai, pegawai, jabatan } from "@/lib/db/schema";
import { requireAuth, requireAdmin } from "@/lib/api-auth";
import {
  jabatanPegawaiSchema,
  jabatanPegawaiUpdateSchema,
} from "@/lib/validations/jabatanPegawai";
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

interface JabatanPegawaiRow {
  id: number;
  nip: string;
  kodeJabatan: string;
  status: "Aktif" | "Nonaktif";
  periode: string | null;
  namaPegawai: string | null;
  namaJabatan: string | null;
}

const toResponse = (row: JabatanPegawaiRow) => ({
  id: row.id,
  nip: row.nip,
  kodeJabatan: row.kodeJabatan,
  status: row.status,
  periode: row.periode,
  pegawai: row.namaPegawai ? { namaLengkap: row.namaPegawai } : null,
  jabatan: row.namaJabatan ? { namaJabatan: row.namaJabatan } : null,
});

const app = new Hono();

app.get("/", requireAuth, async (c) => {
  const search = c.req.query("search") || "";
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(c.req.query("limit") || "10", 10)));
  const offset = (page - 1) * limit;

  const where = and(
    isNull(jabatanPegawai.deletedAt),
    search
      ? or(
          like(pegawai.namaLengkap, `%${search}%`),
          like(jabatan.namaJabatan, `%${search}%`),
          like(jabatanPegawai.nip, `%${search}%`)
        )
      : undefined,
  );

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: jabatanPegawai.id,
        nip: jabatanPegawai.nip,
        kodeJabatan: jabatanPegawai.kodeJabatan,
        status: jabatanPegawai.status,
        periode: jabatanPegawai.periode,
        namaPegawai: pegawai.namaLengkap,
        namaJabatan: jabatan.namaJabatan,
      })
      .from(jabatanPegawai)
      .leftJoin(pegawai, eq(jabatanPegawai.nip, pegawai.nip))
      .leftJoin(jabatan, eq(jabatanPegawai.kodeJabatan, jabatan.kodeJabatan))
      .where(where)
      .orderBy(desc(jabatanPegawai.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(jabatanPegawai)
      .leftJoin(pegawai, eq(jabatanPegawai.nip, pegawai.nip))
      .leftJoin(jabatan, eq(jabatanPegawai.kodeJabatan, jabatan.kodeJabatan))
      .where(where),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return c.json({
    data: rows.map(toResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

app.post("/", requireAuth, requireAdmin, zValidator("json", jabatanPegawaiSchema), async (c) => {
  const body = c.req.valid("json");

  const [p, j] = await Promise.all([
    db.query.pegawai.findFirst({
      where: and(eq(pegawai.nip, body.nip), isNull(pegawai.deletedAt)),
    }),
    db.query.jabatan.findFirst({
      where: and(eq(jabatan.kodeJabatan, body.kodeJabatan), isNull(jabatan.deletedAt)),
    }),
  ]);

  if (!p) return c.json({ error: "Pegawai tidak ditemukan" }, 404);
  if (!j) return c.json({ error: "Jabatan tidak ditemukan" }, 404);

  await db.insert(jabatanPegawai).values(body);
  return c.json({ message: "Penugasan berhasil ditambahkan" }, 201);
});

app.get("/:id", requireAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const rows = await db
    .select({
      id: jabatanPegawai.id,
      nip: jabatanPegawai.nip,
      kodeJabatan: jabatanPegawai.kodeJabatan,
      status: jabatanPegawai.status,
      periode: jabatanPegawai.periode,
      namaPegawai: pegawai.namaLengkap,
      namaJabatan: jabatan.namaJabatan,
    })
    .from(jabatanPegawai)
    .leftJoin(pegawai, eq(jabatanPegawai.nip, pegawai.nip))
    .leftJoin(jabatan, eq(jabatanPegawai.kodeJabatan, jabatan.kodeJabatan))
    .where(and(eq(jabatanPegawai.id, id), isNull(jabatanPegawai.deletedAt)))
    .limit(1);

  if (rows.length === 0) return c.json({ error: "Penugasan tidak ditemukan" }, 404);
  return c.json({ data: toResponse(rows[0]) });
});

app.put("/:id", requireAuth, requireAdmin, zValidator("json", jabatanPegawaiUpdateSchema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const body = c.req.valid("json");

  const existing = await db.query.jabatanPegawai.findFirst({
    where: and(eq(jabatanPegawai.id, id), isNull(jabatanPegawai.deletedAt)),
  });
  if (!existing) return c.json({ error: "Penugasan tidak ditemukan" }, 404);

  if (body.nip || body.kodeJabatan) {
    const [p, j] = await Promise.all([
      body.nip
        ? db.query.pegawai.findFirst({
            where: and(eq(pegawai.nip, body.nip), isNull(pegawai.deletedAt)),
          })
        : Promise.resolve(true),
      body.kodeJabatan
        ? db.query.jabatan.findFirst({
            where: and(eq(jabatan.kodeJabatan, body.kodeJabatan), isNull(jabatan.deletedAt)),
          })
        : Promise.resolve(true),
    ]);

    if (!p) return c.json({ error: "Pegawai tidak ditemukan" }, 404);
    if (!j) return c.json({ error: "Jabatan tidak ditemukan" }, 404);
  }

  await db.update(jabatanPegawai).set(body).where(eq(jabatanPegawai.id, id));
  return c.json({ message: "Penugasan berhasil diperbarui" });
});

app.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const existing = await db.query.jabatanPegawai.findFirst({
    where: and(eq(jabatanPegawai.id, id), isNull(jabatanPegawai.deletedAt)),
  });
  if (!existing) return c.json({ error: "Penugasan tidak ditemukan" }, 404);

  await db
    .update(jabatanPegawai)
    .set({ deletedAt: sql`now()` })
    .where(eq(jabatanPegawai.id, id));
  return c.json({ message: "Penugasan berhasil dihapus" });
});

app.get("/export/csv", requireAuth, async (c) => {
  const rows = await db
    .select({
      id: jabatanPegawai.id,
      nip: jabatanPegawai.nip,
      kodeJabatan: jabatanPegawai.kodeJabatan,
      status: jabatanPegawai.status,
      periode: jabatanPegawai.periode,
      namaPegawai: pegawai.namaLengkap,
      namaJabatan: jabatan.namaJabatan,
    })
    .from(jabatanPegawai)
    .leftJoin(pegawai, eq(jabatanPegawai.nip, pegawai.nip))
    .leftJoin(jabatan, eq(jabatanPegawai.kodeJabatan, jabatan.kodeJabatan))
    .where(isNull(jabatanPegawai.deletedAt))
    .orderBy(desc(jabatanPegawai.createdAt));

  const headers = ["ID", "NIP", "Nama Pegawai", "Kode Jabatan", "Nama Jabatan", "Status", "Periode"];
  const dataRows = rows.map((jp) => [
    String(jp.id),
    jp.nip,
    `"${(jp.namaPegawai || "").replace(/"/g, '""')}"`,
    jp.kodeJabatan,
    `"${(jp.namaJabatan || "").replace(/"/g, '""')}"`,
    jp.status,
    jp.periode,
  ]);

  const csv = [headers.join(","), ...dataRows.map((r) => r.join(","))].join("\n");

  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", "attachment; filename=jabatan_pegawai.csv");
  return c.body(csv);
});

export default app;
