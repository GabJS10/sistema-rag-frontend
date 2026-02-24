import { z } from "zod";

export const registerSchema = z
  .object({
    first_name: z.string().min(1, { message: "El nombre es requerido" }),
    birth_date: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Ingrese una fecha válida" }),
    email: z.email({ message: "Ingrese un correo electrónico válido" }),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
