import { z } from "zod";

/**
 * Campos comunes reutilizables para diferentes schemas
 */
export const fields = {
  // Strings básicos
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),

  surname: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(100, "El apellido no puede exceder 100 caracteres"),

  email: z.string().email("Email inválido"),

  username: z
    .string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(50, "El username no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "El username solo puede contener letras, números y guiones bajos",
    ),

  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),

  passwordRequired: z.string().min(1, "La contraseña es requerida"),

  role: z.enum(["ADMIN", "CLIENT"]),

  id: z.number().int().positive("El ID debe ser un número positivo"),
  idString: z.string().regex(/^\d+$/, "ID inválido").transform(Number),

  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
};

// ==================== SCHEMAS DE DTOs (Request Inputs) ====================

/**
 * Schemas para validar datos de entrada en requests.
 * No representan modelos de BD, sino DTOs (Data Transfer Objects).
 */
export const dtoSchemas = {
  auth: {
    register: z.object({
      name: fields.name,
      surname: fields.surname,
      email: fields.email,
      username: fields.username,
      password: fields.password,
      role: fields.role.optional(),
    }),

    login: z.object({
      email: fields.email,
      password: fields.passwordRequired,
    }),

    changePassword: z.object({
      currentPassword: fields.passwordRequired,
      newPassword: fields.password,
    }),
  },
};

// ==================== TIPOS INFERIDOS ====================

export type RegisterInput = z.infer<typeof dtoSchemas.auth.register>;
export type LoginInput = z.infer<typeof dtoSchemas.auth.login>;
export type ChangePasswordInput = z.infer<
  typeof dtoSchemas.auth.changePassword
>;
