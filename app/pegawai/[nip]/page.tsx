import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { pegawai } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Pencil, User } from "lucide-react";

export default async function ViewPegawaiPage({
  params,
}: {
  params: Promise<{ nip: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "admin";
  const { nip } = await params;

  const data = await db.query.pegawai.findFirst({
    where: and(eq(pegawai.nip, nip), isNull(pegawai.deletedAt)),
  });

  if (!data) {
    notFound();
  }

  const formatDate = (value: Date | string) => {
    if (typeof value === "string") return value;
    return value.toISOString().split("T")[0];
  };

  const rows = [
    { label: "NIP", value: data.nip },
    { label: "Nama Lengkap", value: data.namaLengkap },
    {
      label: "Jenis Kelamin",
      value: data.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
    },
    { label: "Tanggal Lahir", value: formatDate(data.tanggalLahir) },
    { label: "Alamat", value: data.alamat || "-" },
    { label: "No HP", value: data.noHp || "-" },
    { label: "Email", value: data.email || "-" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" asChild>
              <Link href="/pegawai">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="outline">
                <Link href={`/pegawai/${nip}/edit`}>
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
                <CardTitle className="text-xl">Detail Pegawai</CardTitle>
                <p className="text-sm text-muted-foreground">{data.nip}</p>
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
                    {row.label === "Jenis Kelamin" ? (
                      <Badge variant={data.jenisKelamin === "L" ? "default" : "secondary"}>
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
