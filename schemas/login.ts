import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Ingrese un correo electrónico válido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});
