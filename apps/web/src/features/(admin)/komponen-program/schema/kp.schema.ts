import { z } from "zod";

export const KpSchema = z.object({
  kategoriId: z.number().min(1, "Kategori wajib diisi"),
  kode: z.string().min(1, "Kode wajib diisi"),
  name: z.string().min(1, "Nama komponen program wajib diisi"),
  kode_parent: z.number().nullable().optional(),
});

export type KpSchema = z.infer<typeof KpSchema>;