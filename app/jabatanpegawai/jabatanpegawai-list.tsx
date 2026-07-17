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
import { Plus, FileDown, Eye, Pencil, ClipboardList } from "lucide-react";

interface JabatanPegawai {
  id: number;
  nip: string;
  kodeJabatan: string;
  status: "Aktif" | "Nonaktif";
  periode: string | null;
  pegawai?: { namaLengkap: string };
  jabatan?: { namaJabatan: string };
}

interface JabatanPegawaiListProps {
  isAdmin: boolean;
}

export function JabatanPegawaiList({ isAdmin }: JabatanPegawaiListProps) {
  const [data, setData] = useState<JabatanPegawai[]>([]);
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

    const res = await fetch(`/api/jabatanpegawai?${params.toString()}`);
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.pagination?.total || 0);
    setTotalPages(json.pagination?.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search]);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/jabatanpegawai/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Penugasan berhasil dihapus");
      fetchData();
    } else {
      toast.error("Gagal menghapus penugasan");
    }
  };

  const handleExport = () => {
    window.open("/api/jabatanpegawai/export/csv", "_blank");
  };

  return (
    <Card>
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Penugasan Jabatan</CardTitle>
              <p className="text-sm text-muted-foreground">
                {total} penugasan aktif
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
              placeholder="Cari nama pegawai/jabatan"
            />
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            {isAdmin && (
              <Button asChild>
                <Link href="/jabatanpegawai/tambah">
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
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Pegawai</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-32">Periode</TableHead>
                    <TableHead className="w-32 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Tidak ada data penugasan
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{item.pegawai?.namaLengkap || "-"}</div>
                          <div className="text-xs text-muted-foreground">{item.nip}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.jabatan?.namaJabatan || "-"}</div>
                          <div className="text-xs text-muted-foreground">{item.kodeJabatan}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === "Aktif" ? "default" : "secondary"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.periode || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" asChild className="h-8 w-8">
                              <Link href={`/jabatanpegawai/${item.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {isAdmin && (
                              <>
                                <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                  <Link href={`/jabatanpegawai/${item.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <DeleteDialog
                                  title="Hapus Penugasan"
                                  description="Yakin hapus penugasan ini?"
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
