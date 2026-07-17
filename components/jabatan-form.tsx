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

interface JabatanFormData {
  kodeJabatan: string;
  namaJabatan: string;
  level: number;
  gaji: number | string;
}

interface JabatanFormProps {
  initialData?: Partial<JabatanFormData>;
  mode: "create" | "edit";
  kodeJabatan?: string;
}

export function JabatanForm({ initialData, mode, kodeJabatan }: JabatanFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<JabatanFormData>({
    kodeJabatan: initialData?.kodeJabatan || "",
    namaJabatan: initialData?.namaJabatan || "",
    level: initialData?.level || 1,
    gaji: initialData?.gaji !== undefined ? Number(initialData.gaji) : 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "kodeJabatan" || name === "namaJabatan" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = mode === "create" ? "/api/jabatan" : `/api/jabatan/${kodeJabatan}`;
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

    toast.success(mode === "create" ? "Jabatan berhasil ditambahkan" : "Jabatan berhasil diperbarui");
    router.push("/jabatan");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="outline" className="mb-6" onClick={() => router.push("/jabatan")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-xl">
            {mode === "create" ? "Tambah Jabatan" : "Edit Jabatan"}
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
              <Label htmlFor="kodeJabatan">Kode Jabatan</Label>
              <Input
                id="kodeJabatan"
                name="kodeJabatan"
                value={form.kodeJabatan}
                onChange={handleChange}
                required
                disabled={mode === "edit"}
                placeholder="Contoh: J001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaJabatan">Nama Jabatan</Label>
              <Input
                id="namaJabatan"
                name="namaJabatan"
                value={form.namaJabatan}
                onChange={handleChange}
                required
                placeholder="Masukkan nama jabatan"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  min={1}
                  value={form.level}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gaji">Gaji</Label>
                <Input
                  id="gaji"
                  name="gaji"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.gaji}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan gaji"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/jabatan")}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
