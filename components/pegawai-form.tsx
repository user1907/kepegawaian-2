"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

interface PegawaiFormData {
  nip: string;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string | Date;
  alamat: string | null;
  noHp: string | null;
  email: string | null;
}

interface PegawaiFormProps {
  initialData?: Partial<PegawaiFormData>;
  mode: "create" | "edit";
  nip?: string;
}

export function PegawaiForm({ initialData, mode, nip }: PegawaiFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formatDate = (value?: string | Date | null) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.toISOString().split("T")[0];
  };

  const [form, setForm] = useState<{
    nip: string;
    namaLengkap: string;
    jenisKelamin: "L" | "P";
    tanggalLahir: string;
    alamat: string;
    noHp: string;
    email: string;
  }>({
    nip: initialData?.nip || "",
    namaLengkap: initialData?.namaLengkap || "",
    jenisKelamin: initialData?.jenisKelamin || "L",
    tanggalLahir: formatDate(initialData?.tanggalLahir),
    alamat: initialData?.alamat || "",
    noHp: initialData?.noHp || "",
    email: initialData?.email || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = mode === "create" ? "/api/pegawai" : `/api/pegawai/${nip}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Terjadi kesalahan");
      setLoading(false);
      return;
    }

    toast.success(mode === "create" ? "Pegawai berhasil ditambahkan" : "Pegawai berhasil diperbarui");
    router.push("/pegawai");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="outline" className="mb-6" onClick={() => router.push("/pegawai")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-xl">
            {mode === "create" ? "Tambah Pegawai" : "Edit Pegawai"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  name="nip"
                  value={form.nip}
                  onChange={handleChange}
                  required
                  disabled={mode === "edit"}
                  placeholder="Masukkan NIP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="namaLengkap">Nama Lengkap</Label>
                <Input
                  id="namaLengkap"
                  name="namaLengkap"
                  value={form.namaLengkap}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                <select
                  id="jenisKelamin"
                  name="jenisKelamin"
                  value={form.jenisKelamin}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                <Input
                  id="tanggalLahir"
                  name="tanggalLahir"
                  type="date"
                  value={form.tanggalLahir}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <textarea
                id="alamat"
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                rows={3}
                placeholder="Masukkan alamat"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="noHp">No HP</Label>
                <Input
                  id="noHp"
                  name="noHp"
                  value={form.noHp}
                  onChange={handleChange}
                  placeholder="Masukkan nomor HP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Masukkan email"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/pegawai")}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
