import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";
import type { User } from "better-auth";

declare module "hono" {
  interface ContextVariableMap {
    user: User & { role: string };
  }
}

export const requireAuth = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user as User & { role: string });
  await next();
});

export const requireAdmin = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});
