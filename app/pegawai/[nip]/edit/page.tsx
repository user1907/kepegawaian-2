import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PegawaiForm } from "@/components/pegawai-form";
import { db } from "@/lib/db";
import { pegawai } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export default async function EditPegawaiPage({
  params,
}: {
  params: Promise<{ nip: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/pegawai");
  }

  const { nip } = await params;

  const data = await db.query.pegawai.findFirst({
    where: and(eq(pegawai.nip, nip), isNull(pegawai.deletedAt)),
  });

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Pegawai</h1>
        <PegawaiForm mode="edit" nip={nip} initialData={data} />
      </main>
    </div>
  );
}
