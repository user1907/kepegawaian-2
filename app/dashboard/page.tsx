import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { pegawai, jabatan, jabatanPegawai } from "@/lib/db/schema";
import { isNull, count } from "drizzle-orm";
import { Users, Briefcase, ClipboardList, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [pegawaiCount, jabatanCount, penugasanCount] = await Promise.all([
    db.select({ value: count() }).from(pegawai).where(isNull(pegawai.deletedAt)),
    db.select({ value: count() }).from(jabatan).where(isNull(jabatan.deletedAt)),
    db.select({ value: count() }).from(jabatanPegawai).where(isNull(jabatanPegawai.deletedAt)),
  ]);

  const stats = [
    {
      title: "Total Pegawai",
      value: pegawaiCount[0].value,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      title: "Total Jabatan",
      value: jabatanCount[0].value,
      icon: Briefcase,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      title: "Total Penugasan",
      value: penugasanCount[0].value,
      icon: ClipboardList,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  const modules = [
    {
      title: "Data Pegawai",
      description: "Kelola data lengkap pegawai termasuk NIP, jabatan, dan status.",
      href: "/pegawai",
      icon: Users,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
    },
    {
      title: "Data Jabatan",
      description: "Atur daftar jabatan, level, dan gaji yang tersedia.",
      href: "/jabatan",
      icon: Briefcase,
      color: "bg-emerald-600",
      lightColor: "bg-emerald-50",
    },
    {
      title: "Penugasan Jabatan",
      description: "Tetapkan pegawai ke jabatan tertentu dengan periode dan status.",
      href: "/jabatanpegawai",
      icon: ClipboardList,
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali, {session.user.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className={`${stat.border} ${stat.bg}`}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl p-3 ${stat.bg} ${stat.color} border ${stat.border}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modules */}
        <div className="grid gap-6 md:grid-cols-3">
          {modules.map((module) => (
            <Card
              key={module.href}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className={`border-0 text-white ${module.color}`}>
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-white/20 p-3">
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl font-semibold text-white">
                  {module.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-6">
                  {module.description}
                </p>
                <Button asChild className="w-full">
                  <Link href={module.href}>
                    Buka Modul
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
