import { z } from "zod";

export const jabatanSchema = z.object({
  kodeJabatan: z.string().min(1).max(20),
  namaJabatan: z.string().min(1).max(100),
  level: z.coerce.number().int().min(1),
  gaji: z.coerce.number().min(0),
});

export const jabatanUpdateSchema = jabatanSchema
  .omit({ kodeJabatan: true })
  .partial();

export type JabatanInput = z.infer<typeof jabatanSchema>;
export type JabatanUpdateInput = z.infer<typeof jabatanUpdateSchema>;
