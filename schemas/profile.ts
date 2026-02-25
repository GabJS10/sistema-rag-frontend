import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha debe estar en formato YYYY-MM-DD" }).optional().or(z.literal("")),
  avatarUrl: z.string().url({ message: "URL de avatar inválida" }).optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;