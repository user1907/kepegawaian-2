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
import { Plus, FileDown, Eye, Pencil, Users } from "lucide-react";

interface Pegawai {
  nip: string;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  alamat: string | null;
  noHp: string | null;
  email: string | null;
}

interface PegawaiListProps {
  isAdmin: boolean;
}

export function PegawaiList({ isAdmin }: PegawaiListProps) {
  const [data, setData] = useState<Pegawai[]>([]);
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

    const res = await fetch(`/api/pegawai?${params.toString()}`);
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.pagination?.total || 0);
    setTotalPages(json.pagination?.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search]);

  const handleDelete = async (nip: string) => {
    const res = await fetch(`/api/pegawai/${nip}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Pegawai berhasil dihapus");
      fetchData();
    } else {
      toast.error("Gagal menghapus pegawai");
    }
  };

  const handleExport = () => {
    window.open("/api/pegawai/export/csv", "_blank");
  };

  return (
    <Card>
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Data Pegawai</CardTitle>
              <p className="text-sm text-muted-foreground">
                {total} pegawai tersedia
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
              placeholder="Cari NIP atau nama"
            />
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            {isAdmin && (
              <Button asChild>
                <Link href="/pegawai/tambah">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Link>
              </Button>
            )}
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
                    <TableHead className="w-32">NIP</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead className="w-28">Jenis Kelamin</TableHead>
                    <TableHead className="w-32">Tgl Lahir</TableHead>
                    <TableHead>No HP</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-32 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        Tidak ada data pegawai
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.nip}>
                        <TableCell className="font-medium">{item.nip}</TableCell>
                        <TableCell>{item.namaLengkap}</TableCell>
                        <TableCell>
                          <Badge variant={item.jenisKelamin === "L" ? "default" : "secondary"}>
                            {item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.tanggalLahir.split("T")[0]}</TableCell>
                        <TableCell className="text-muted-foreground">{item.noHp || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{item.email || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" asChild className="h-8 w-8">
                              <Link href={`/pegawai/${item.nip}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {isAdmin && (
                              <>
                                <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                  <Link href={`/pegawai/${item.nip}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <DeleteDialog
                                  title="Hapus Pegawai"
                                  description={`Yakin hapus pegawai ${item.namaLengkap}?`}
                                  onConfirm={() => handleDelete(item.nip)}
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
