import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { JabatanPegawaiForm } from "@/components/jabatanpegawai-form";
import { db } from "@/lib/db";
import { jabatanPegawai } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export default async function EditJabatanPegawaiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/jabatanpegawai");
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);

  const data = await db.query.jabatanPegawai.findFirst({
    where: and(eq(jabatanPegawai.id, numericId), isNull(jabatanPegawai.deletedAt)),
  });

  if (!data) {
    notFound();
  }

  const initialData = {
    ...data,
    periode: data.periode ?? undefined,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Penugasan</h1>
        <JabatanPegawaiForm mode="edit" id={numericId} initialData={initialData} />
      </main>
    </div>
  );
}
