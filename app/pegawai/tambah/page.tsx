import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PegawaiForm } from "@/components/pegawai-form";

export default async function TambahPegawaiPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/pegawai");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Tambah Pegawai</h1>
        <PegawaiForm mode="create" />
      </main>
    </div>
  );
}
