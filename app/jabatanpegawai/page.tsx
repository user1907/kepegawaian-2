import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { JabatanPegawaiList } from "./jabatanpegawai-list";

export default async function JabatanPegawaiPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <JabatanPegawaiList isAdmin={session.user.role === "admin"} />
      </main>
    </div>
  );
}
