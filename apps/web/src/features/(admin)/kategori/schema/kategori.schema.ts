import z from "zod"

export const kategoriSchema = z.object({
    name: z.string()
})

export type createKategoriInput = z.infer<typeof kategoriSchema>