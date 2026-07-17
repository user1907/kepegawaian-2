import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, Pencil, Shield, User } from "lucide-react";

export default async function ViewUserPage({
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
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!data) {
    notFound();
  }

  const rows = [
    { label: "ID", value: data.id },
    { label: "Nama", value: data.name },
    { label: "Email", value: data.email },
    {
      label: "Role",
      value: data.role === "admin" ? "Admin" : "Staff",
      badge: true,
    },
    { label: "Email Terverifikasi", value: data.emailVerified ? "Ya" : "Tidak" },
    { label: "Dibuat", value: new Date(data.createdAt).toLocaleString("id-ID") },
    { label: "Diperbarui", value: new Date(data.updatedAt).toLocaleString("id-ID") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" asChild>
              <Link href="/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
            {data.id !== session.user.id && (
              <Button asChild variant="outline">
                <Link href={`/users/${id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
          <Card>
            <CardHeader className="border-b bg-muted/30 flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Detail User</CardTitle>
                <p className="text-sm text-muted-foreground">{data.email}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b px-6 py-4 last:border-0"
                >
                  <div className="font-medium text-muted-foreground">{row.label}</div>
                  <div className="sm:col-span-2">
                    {"badge" in row && row.badge ? (
                      <Badge variant={data.role === "admin" ? "default" : "secondary"}>
                        {row.value}
                      </Badge>
                    ) : (
                      row.value
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
