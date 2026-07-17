"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Menampilkan {total > 0 ? (page - 1) * limit + 1 : 0} -{" "}
        {Math.min(page * limit, total)} dari {total} data
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Sebelumnya
        </Button>
        <span className="text-sm min-w-[120px] text-center">
          Halaman {page} dari {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Berikutnya
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Tampilkan</span>
        <Select
          value={String(limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
