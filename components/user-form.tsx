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

interface UserFormData {
  name: string;
  email: string;
  role: "admin" | "staff";
  password?: string;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  mode: "create" | "edit";
  id?: string;
}

export function UserForm({ initialData, mode, id }: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UserFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: initialData?.role || "staff",
    password: "",
  });

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

    const url = mode === "create" ? "/api/users" : `/api/users/${id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const body = mode === "create"
      ? form
      : { name: form.name, email: form.email, role: form.role };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Terjadi kesalahan");
      setLoading(false);
      return;
    }

    toast.success(mode === "create" ? "User berhasil ditambahkan" : "User berhasil diperbarui");
    router.push("/users");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="outline" className="mb-6" onClick={() => router.push("/users")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-xl">
            {mode === "create" ? "Tambah User" : "Edit User"}
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
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Nama lengkap"
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
                required
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/users")}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
