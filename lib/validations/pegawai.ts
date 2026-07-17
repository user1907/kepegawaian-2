import { z } from "zod";

export const pegawaiSchema = z.object({
  nip: z.string().min(1).max(20),
  namaLengkap: z.string().min(1).max(100),
  jenisKelamin: z.enum(["L", "P"]),
  tanggalLahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  alamat: z.string().max(1000).optional().nullable(),
  noHp: z.string().max(20).optional().nullable(),
  email: z.string().email().max(100).optional().nullable(),
});

export const pegawaiUpdateSchema = pegawaiSchema
  .omit({ nip: true })
  .partial();

export type PegawaiInput = z.infer<typeof pegawaiSchema>;
export type PegawaiUpdateInput = z.infer<typeof pegawaiUpdateSchema>;
