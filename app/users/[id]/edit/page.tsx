import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { UserForm } from "@/components/user-form";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    notFound();
  }

  const { id } = await params;

  const data = await db.query.user.findFirst({
    where: eq(user.id, id),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <UserForm
          mode="edit"
          id={id}
          initialData={{
            ...data,
            role: data.role === "admin" ? "admin" : "staff",
          }}
        />
      </main>
    </div>
  );
}
