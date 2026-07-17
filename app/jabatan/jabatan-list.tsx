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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { SearchForm } from "@/components/search-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { toast } from "sonner";
import { Plus, FileDown, Eye, Pencil, Briefcase } from "lucide-react";

interface Jabatan {
  kodeJabatan: string;
  namaJabatan: string;
  level: number;
  gaji: string;
}

interface JabatanListProps {
  isAdmin: boolean;
}

export function JabatanList({ isAdmin }: JabatanListProps) {
  const [data, setData] = useState<Jabatan[]>([]);
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

    const res = await fetch(`/api/jabatan?${params.toString()}`);
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.pagination?.total || 0);
    setTotalPages(json.pagination?.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search]);

  const handleDelete = async (kode: string) => {
    const res = await fetch(`/api/jabatan/${kode}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Jabatan berhasil dihapus");
      fetchData();
    } else {
      toast.error("Gagal menghapus jabatan");
    }
  };

  const handleExport = () => {
    window.open("/api/jabatan/export/csv", "_blank");
  };

  return (
    <Card>
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Data Jabatan</CardTitle>
              <p className="text-sm text-muted-foreground">
                {total} jabatan tersedia
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
              placeholder="Cari kode atau nama"
            />
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            {isAdmin && (
              <Button asChild>
                <Link href="/jabatan/tambah">
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
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Jabatan</TableHead>
                    <TableHead className="w-24">Level</TableHead>
                    <TableHead className="w-40">Gaji</TableHead>
                    <TableHead className="w-32 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        Tidak ada data jabatan
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.kodeJabatan}>
                        <TableCell className="font-medium">{item.kodeJabatan}</TableCell>
                        <TableCell>{item.namaJabatan}</TableCell>
                        <TableCell>{item.level}</TableCell>
                        <TableCell className="font-medium">
                          Rp {Number(item.gaji).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" asChild className="h-8 w-8">
                              <Link href={`/jabatan/${item.kodeJabatan}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {isAdmin && (
                              <>
                                <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                  <Link href={`/jabatan/${item.kodeJabatan}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <DeleteDialog
                                  title="Hapus Jabatan"
                                  description={`Yakin hapus jabatan ${item.namaJabatan}?`}
                                  onConfirm={() => handleDelete(item.kodeJabatan)}
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
