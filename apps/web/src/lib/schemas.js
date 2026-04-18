import { z } from "zod";

/**
 * Schemas Zod reutilizables para validación frontend.
 * Se componen para construir schemas de formularios específicos.
 */

// ─── Primitivos ───────────────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .min(1, "El correo es requerido")
  .email("Correo electrónico inválido");

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

export const requiredString = (label = "Este campo") =>
  z.string().min(1, `${label} es requerido`);

export const optionalString = z.string().optional();

// ─── Forms completos ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
