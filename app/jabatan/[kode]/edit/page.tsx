import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { JabatanForm } from "@/components/jabatan-form";
import { db } from "@/lib/db";
import { jabatan } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export default async function EditJabatanPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/jabatan");
  }

  const { kode } = await params;

  const data = await db.query.jabatan.findFirst({
    where: and(eq(jabatan.kodeJabatan, kode), isNull(jabatan.deletedAt)),
  });

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Jabatan</h1>
        <JabatanForm mode="edit" kodeJabatan={kode} initialData={data} />
      </main>
    </div>
  );
}
