import type z from "zod";
import { ValidationError } from "../../utils/errors.js";

export const validateInputs = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  action: string,
): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    throw new ValidationError("Error de validación", errors, {
      resource: "auth",
      action,
      details: { fields: errors.map((e) => e.field) },
    });
  }

  return result.data;
};
