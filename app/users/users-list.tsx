"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { SearchForm } from "@/components/search-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Shield, User } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  emailVerified: boolean;
  createdAt: string;
}

interface UserListProps {
  currentUserId: string;
}

export function UserList({ currentUserId }: UserListProps) {
  const [data, setData] = useState<UserItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);

    const res = await fetch(`/api/users?${params.toString()}`);
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.pagination?.total || 0);
    setTotalPages(json.pagination?.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (res.ok) {
      toast.success("User berhasil dihapus");
      fetchData();
    } else {
      toast.error(json.error || "Gagal menghapus user");
    }
  };

  return (
    <Card>
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Manajemen User</CardTitle>
              <p className="text-sm text-muted-foreground">
                {total} user terdaftar
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SearchForm
              defaultValue={search}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Cari nama atau email"
            />
            <Button asChild>
              <Link href="/users/tambah">
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Memuat...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-28">Role</TableHead>
                    <TableHead className="w-40">Bergabung</TableHead>
                    <TableHead className="w-32 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        Tidak ada data user
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                            </span>
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.email}</TableCell>
                        <TableCell>
                          <Badge variant={item.role === "admin" ? "default" : "secondary"}>
                            {item.role === "admin" ? "Admin" : "Staff"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" asChild className="h-8 w-8">
                              <Link href={`/users/${item.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {item.id !== currentUserId && (
                              <>
                                <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                  <Link href={`/users/${item.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <DeleteDialog
                                  title="Hapus User"
                                  description={`Yakin hapus user ${item.name}?`}
                                  onConfirm={() => handleDelete(item.id)}
                                />
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="border-t p-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                limit={limit}
                total={total}
                onPageChange={setPage}
                onLimitChange={(value) => {
                  setLimit(value);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
