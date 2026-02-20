/**
 * Contexto adicional para debugging de errores
 */
export interface ErrorContext {
  /** Recurso afectado (user, product, etc.) */
  resource?: string;
  /** ID del recurso */
  resourceId?: string | number;
  /** Acción que se intentó realizar */
  action?: string;
  /** Datos adicionales para debug */
  details?: Record<string, unknown>;
  /** Timestamp del error */
  timestamp?: Date;
}

/**
 * Error base de la aplicación con contexto para debugging
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context: ErrorContext;

  constructor(
    message: string,
    statusCode: number = 500,
    context: ErrorContext = {},
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = {
      ...context,
      timestamp: new Date(),
    };

    // Mantener el stack trace correcto
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error 400 - Bad Request (datos inválidos, validación fallida)
 */
export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    errors: Array<{ field: string; message: string }> = [],
    context: ErrorContext = {},
  ) {
    super(message, 400, { ...context, action: "validation" });
    this.errors = errors;
  }
}

/**
 * Error 401 - Unauthorized (no autenticado)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "No autenticado", context: ErrorContext = {}) {
    super(message, 401, { ...context, action: "authentication" });
  }
}

/**
 * Error 403 - Forbidden (sin permisos)
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = "No tienes permisos para acceder a este recurso",
    context: ErrorContext = {},
  ) {
    super(message, 403, { ...context, action: "authorization" });
  }
}

/**
 * Error 404 - Not Found
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Recurso no encontrado",
    context: ErrorContext = {},
  ) {
    super(message, 404, context);
  }
}

/**
 * Error 409 - Conflict (recurso duplicado)
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "El recurso ya existe",
    context: ErrorContext = {},
  ) {
    super(message, 409, context);
  }
}

/**
 * Error 500 - Internal Server Error
 */
export class InternalError extends AppError {
  constructor(
    message: string = "Error interno del servidor",
    context: ErrorContext = {},
  ) {
    super(message, 500, context, false);
  }
}
