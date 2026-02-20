import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../../utils/errors.js";
import config from "../../config/config.js";

/**
 * Interfaz para la respuesta de error estandarizada
 */
interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;
  context?: {
    resource?: string;
    resourceId?: string | number;
    action?: string;
    timestamp?: Date;
  };
  stack?: string;
}

/**
 * Middleware global para manejo de errores
 * Estandariza todas las respuestas de error de la API
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Construir respuesta base
  const response: ErrorResponse = {
    success: false,
    message: "Error interno del servidor",
    statusCode: 500,
  };

  // Si es un error de la aplicación (AppError o derivados)
  if (err instanceof AppError) {
    response.message = err.message;
    response.statusCode = err.statusCode;

    // Incluir contexto para debugging (solo propiedades definidas)
    if (err.context) {
      const ctx: ErrorResponse["context"] = {};
      if (err.context.resource !== undefined)
        ctx.resource = err.context.resource;
      if (err.context.resourceId !== undefined)
        ctx.resourceId = err.context.resourceId;
      if (err.context.action !== undefined) ctx.action = err.context.action;
      if (err.context.timestamp !== undefined)
        ctx.timestamp = err.context.timestamp;
      if (Object.keys(ctx).length > 0) response.context = ctx;
    }

    // Si es un error de validación, incluir los errores de campo
    if (err instanceof ValidationError && err.errors.length > 0) {
      response.errors = err.errors;
    }

    // Log del error con contexto completo
    console.error(`❌ [${response.statusCode}] ${err.message}`, {
      context: err.context,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: (req as any).user?.userId,
    });
  } else {
    // Error no controlado
    console.error("❌ Unhandled Error:", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: config.env === "development" ? req.body : "[HIDDEN]",
    });

    // En desarrollo, mostrar mensaje real; en producción, mensaje genérico
    if (config.env === "development") {
      response.message = err.message;
    }
  }

  // Incluir stack trace solo en desarrollo
  if (config.env === "development" && err.stack) {
    response.stack = err.stack;
  }

  res.status(response.statusCode).json(response);
};

/**
 * Middleware para rutas no encontradas (404)
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Endpoint no encontrado",
    statusCode: 404,
    context: {
      path: req.path,
      method: req.method,
      timestamp: new Date(),
    },
  });
};
