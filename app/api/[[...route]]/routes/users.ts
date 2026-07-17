import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { requireAuth, requireAdmin } from "@/lib/api-auth";
import { userSchema, userUpdateSchema } from "@/lib/validations/user";
import {
  and,
  or,
  like,
  desc,
  eq,
  count,
} from "drizzle-orm";

const app = new Hono();

// List with search & pagination
app.get("/", requireAuth, requireAdmin, async (c) => {
  const search = c.req.query("search") || "";
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(c.req.query("limit") || "10", 10)));
  const offset = (page - 1) * limit;

  const where = search
    ? or(
        like(user.name, `%${search}%`),
        like(user.email, `%${search}%`)
      )
    : undefined;

  const [data, totalResult] = await Promise.all([
    db.query.user.findMany({
      where,
      limit,
      offset,
      orderBy: desc(user.createdAt),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.select({ value: count() }).from(user).where(where),
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

// Create user via Better Auth sign-up
app.post("/", requireAuth, requireAdmin, zValidator("json", userSchema), async (c) => {
  const body = c.req.valid("json");

  try {
    await auth.api.signUpEmail({
      body: {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
      },
      headers: new Headers(),
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal membuat user" }, 400);
  }

  return c.json({ message: "User berhasil ditambahkan" }, 201);
});

// Detail
app.get("/:id", requireAuth, requireAdmin, async (c) => {
  const id = c.req.param("id");
  const data = await db.query.user.findFirst({
    where: eq(user.id, id),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!data) return c.json({ error: "User tidak ditemukan" }, 404);
  return c.json({ data });
});

// Update
app.put("/:id", requireAuth, requireAdmin, zValidator("json", userUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const currentUser = c.get("user");

  const existing = await db.query.user.findFirst({
    where: eq(user.id, id),
  });
  if (!existing) return c.json({ error: "User tidak ditemukan" }, 404);

  // Self-protection: admin cannot downgrade their own role
  if (id === currentUser.id && body.role && body.role !== "admin") {
    return c.json({ error: "Anda tidak dapat mengubah role admin Anda sendiri" }, 403);
  }

  // Check email uniqueness if changing email
  if (body.email && body.email !== existing.email) {
    const emailTaken = await db.query.user.findFirst({
      where: eq(user.email, body.email),
    });
    if (emailTaken) {
      return c.json({ error: "Email sudah digunakan" }, 409);
    }
  }

  await db.update(user).set(body).where(eq(user.id, id));
  return c.json({ message: "User berhasil diperbarui" });
});

// Hard delete (Better Auth manages sessions/accounts with cascade)
app.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");

  if (id === currentUser.id) {
    return c.json({ error: "Anda tidak dapat menghapus akun Anda sendiri" }, 403);
  }

  const existing = await db.query.user.findFirst({
    where: eq(user.id, id),
  });
  if (!existing) return c.json({ error: "User tidak ditemukan" }, 404);

  // Ensure at least one admin remains
  if (existing.role === "admin") {
    const adminCount = await db
      .select({ value: count() })
      .from(user)
      .where(eq(user.role, "admin"));
    if ((adminCount[0]?.value ?? 0) <= 1) {
      return c.json({ error: "Tidak dapat menghapus admin terakhir" }, 403);
    }
  }

  await db.delete(user).where(eq(user.id, id));
  return c.json({ message: "User berhasil dihapus" });
});

export default app;
