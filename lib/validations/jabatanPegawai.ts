import { z } from "zod";

export const jabatanPegawaiSchema = z.object({
  nip: z.string().min(1).max(20),
  kodeJabatan: z.string().min(1).max(20),
  status: z.enum(["Aktif", "Nonaktif"]),
  periode: z.string().max(50).optional().nullable(),
});

export const jabatanPegawaiUpdateSchema = jabatanPegawaiSchema.partial();

export type JabatanPegawaiInput = z.infer<typeof jabatanPegawaiSchema>;
export type JabatanPegawaiUpdateInput = z.infer<typeof jabatanPegawaiUpdateSchema>;
