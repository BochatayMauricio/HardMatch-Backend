import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../utils/errors.js';
import { AnyZodObject, ZodError } from 'zod';

export const validateSchema = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next(); 
    } catch (error: any) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        next(new ValidationError(
            'Error de validación de datos', 
            formattedErrors,
            { action: 'schemaValidation', details: { body: req.body } }
        ));
      } else {
        next(error);
      }
    }
  };
};