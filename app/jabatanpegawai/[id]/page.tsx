import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { jabatanPegawai, pegawai, jabatan } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft, ClipboardList, Pencil } from "lucide-react";

export default async function ViewJabatanPegawaiPage({
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

  const isAdmin = session.user.role === "admin";
  const { id } = await params;
  const numericId = parseInt(id, 10);

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
    .where(and(eq(jabatanPegawai.id, numericId), isNull(jabatanPegawai.deletedAt)))
    .limit(1);

  if (rows.length === 0) {
    notFound();
  }

  const data = rows[0];

  const detailRows = [
    { label: "ID", value: String(data.id) },
    { label: "NIP", value: data.nip },
    { label: "Nama Pegawai", value: data.namaPegawai || "-" },
    { label: "Kode Jabatan", value: data.kodeJabatan },
    { label: "Nama Jabatan", value: data.namaJabatan || "-" },
    {
      label: "Status",
      value: data.status,
      badge: true,
    },
    { label: "Periode", value: data.periode || "-" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" asChild>
              <Link href="/jabatanpegawai">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="outline">
                <Link href={`/jabatanpegawai/${id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
          <Card>
            <CardHeader className="border-b bg-muted/30 flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Detail Penugasan</CardTitle>
                <p className="text-sm text-muted-foreground">ID #{data.id}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b px-6 py-4 last:border-0"
                >
                  <div className="font-medium text-muted-foreground">{row.label}</div>
                  <div className="sm:col-span-2">
                    {"badge" in row && row.badge ? (
                      <Badge variant={data.status === "Aktif" ? "default" : "secondary"}>
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
