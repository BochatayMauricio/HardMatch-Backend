import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../utils/errors.js';
import { AnyZodObject, ZodError } from 'zod';

export const validateSchema = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Intenta parsear el body con las reglas de Zod
      await schema.parseAsync(req.body);
      
      // Si está todo OK, continúa al Controlador
      next(); 
    } catch (error: any) {
      // Verificamos que sea un error propio de Zod
      if (error instanceof ZodError) {
        // Transformamos el error de Zod al formato { field, message } de tu clase
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'), // Zod usa un array para el path (ej: ['user', 'email'] -> 'user.email')
          message: err.message
        }));

        // ¡Clave! Usamos next() en lugar de throw
        next(new ValidationError(
            'Error de validación de datos', 
            formattedErrors,
            { action: 'schemaValidation', details: { body: req.body } } // Contexto para debug
        ));
      } else {
        // Si por algún motivo falló algo que no es de Zod, lo pasamos al manejador global
        next(error);
      }
    }
  };
};