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

  phone: z
    .string()
    .min(7, "El número de teléfono debe tener al menos 7 dígitos")
    .max(20, "El número de teléfono no puede exceder 20 dígitos")
    .regex(/^\+?[0-9\s\-()]+$/, "Número de teléfono inválido"),
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
      phone: fields.phone,
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
  users: {
    modifyProfile: z.object({
      name: fields.name,
      surname: fields.surname,
      email: fields.email,
      phone: fields.phone,
    }),
  },
};

// ==================== SCHEMAS DE PRODUCTOS ====================
export const createProductSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(255),
  urlAccess: z.string().url("Debe ser una URL válida").optional().or(z.literal('')),
  price: z.number().positive("El precio debe ser mayor a 0"),
  brandId: z.number().int().positive("El ID de la marca debe ser válido"),
  categoryId: z.number().int().positive("El ID de la categoría debe ser válido")
});

// ==================== SCHEMAS DE MARCAS ====================
export const createBrandSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  description: z.string().optional(),
});

// ==================== SCHEMAS DE CATEGORÍAS ====================
export const createCategorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
});


// ==================== SCHEMAS DE OFERTAS ====================
export const createListingSchema = z.object({
  productId: z.number().int().positive("El ID del producto es obligatorio"),
  priceTotal: z.number().positive("El precio debe ser mayor a 0"),
  percentOff: z.number().min(0).max(100).optional(),
  urlAccess: z.string().url("Debe ser una URL válida").optional(),
  expirationAt: z.string().datetime().optional() // Fecha en formato ISO 8601
});

// ==================== SCHEMAS DE CARACTERÍSTICAS ====================
export const createFeatureSchema = z.object({
  keyword: z.string().min(2, "La clave debe tener al menos 2 caracteres").max(100),
  value: z.string().min(1, "El valor es obligatorio").max(255)
});

// Validar la asociación (tabla pivote)
export const assignFeatureSchema = z.object({
  idFeature: z.number().int().positive("El ID de la característica es inválido")
});
// ==================== TIPOS INFERIDOS ====================

export type RegisterInput = z.infer<typeof dtoSchemas.auth.register>;
export type LoginInput = z.infer<typeof dtoSchemas.auth.login>;
export type ChangePasswordInput = z.infer<
  typeof dtoSchemas.auth.changePassword
>;
