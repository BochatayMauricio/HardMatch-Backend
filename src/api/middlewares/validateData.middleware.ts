import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validateSchema = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Intenta parsear el body con las reglas de Zod
      await schema.parseAsync(req.body);
      next(); // Si está todo OK, continúa al Controlador
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "Errores de validación en los datos enviados",
        errors: error.errors
      });
    }
  };
};