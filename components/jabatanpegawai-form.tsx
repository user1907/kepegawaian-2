"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

interface PegawaiOption {
  nip: string;
  namaLengkap: string;
}

interface JabatanOption {
  kodeJabatan: string;
  namaJabatan: string;
}

interface JabatanPegawaiFormData {
  nip: string;
  kodeJabatan: string;
  status: "Aktif" | "Nonaktif";
  periode: string;
}

interface JabatanPegawaiFormProps {
  initialData?: Partial<JabatanPegawaiFormData> & { periode?: string | null };
  mode: "create" | "edit";
  id?: number;
}

export function JabatanPegawaiForm({ initialData, mode, id }: JabatanPegawaiFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pegawaiList, setPegawaiList] = useState<PegawaiOption[]>([]);
  const [jabatanList, setJabatanList] = useState<JabatanOption[]>([]);
  const [form, setForm] = useState<JabatanPegawaiFormData>({
    nip: initialData?.nip || "",
    kodeJabatan: initialData?.kodeJabatan || "",
    status: initialData?.status || "Aktif",
    periode: initialData?.periode || "",
  });

  useEffect(() => {
    const fetchOptions = async () => {
      const [pegawaiRes, jabatanRes] = await Promise.all([
        fetch("/api/pegawai?limit=1000"),
        fetch("/api/jabatan?limit=1000"),
      ]);
      const [pegawaiJson, jabatanJson] = await Promise.all([pegawaiRes.json(), jabatanRes.json()]);
      setPegawaiList(pegawaiJson.data || []);
      setJabatanList(jabatanJson.data || []);
    };
    fetchOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = mode === "create" ? "/api/jabatanpegawai" : `/api/jabatanpegawai/${id}`;
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

    toast.success(mode === "create" ? "Penugasan berhasil ditambahkan" : "Penugasan berhasil diperbarui");
    router.push("/jabatanpegawai");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="outline" className="mb-6" onClick={() => router.push("/jabatanpegawai")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-xl">
            {mode === "create" ? "Tambah Penugasan" : "Edit Penugasan"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nip">Pegawai</Label>
              <select
                id="nip"
                name="nip"
                value={form.nip}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="">-- Pilih Pegawai --</option>
                {pegawaiList.map((p) => (
                  <option key={p.nip} value={p.nip}>
                    {p.nip} - {p.namaLengkap}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kodeJabatan">Jabatan</Label>
              <select
                id="kodeJabatan"
                name="kodeJabatan"
                value={form.kodeJabatan}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="">-- Pilih Jabatan --</option>
                {jabatanList.map((j) => (
                  <option key={j.kodeJabatan} value={j.kodeJabatan}>
                    {j.kodeJabatan} - {j.namaJabatan}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="periode">Periode</Label>
                <Input
                  id="periode"
                  name="periode"
                  value={form.periode}
                  onChange={handleChange}
                  placeholder="Contoh: 2024-2025"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/jabatanpegawai")}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
