import type { Request, Response, NextFunction } from "express";
import { ROLE_ADMIN, ROLE_CLIENT } from "../../config/constants.js";
import { authService } from "../../core/services/auth.service.js";
import type { JwtPayload } from "../../core/interfaces/auth.interfaces.js";
import type { UserAttributes } from "../../core/models/User.js";
import { User } from "../../core/models/User.js";
import { verifyToken } from "../../core/tools/VerifyJwt.js";

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      token?: string;
    }
  }
}

/**
 * Middleware que verifica el token JWT y añade el usuario al request
 * El token debe enviarse en el header: Authorization: Bearer <token>
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Token de autenticación no proporcionado",
      });
      return;
    }

    // Verificar formato "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        success: false,
        message: "Formato de token inválido. Use: Bearer <token>",
      });
      return;
    }

    const token = parts[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      });
      return;
    }

    // Verificar y decodificar el token
    const decoded = verifyToken(token);

    // Añadir payload del token al request
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Error de autenticación",
    });
  }
};

/**
 * Middleware factory que verifica si el usuario tiene uno de los roles permitidos
 * @param allowedRoles - Array de roles permitidos
 */
export const authorize = (...allowedRoles: Array<"ADMIN" | "CLIENT">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "No autenticado",
      });
      return;
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a este recurso",
      });
      return;
    }

    next();
  };
};

/**
 * Middleware que solo permite acceso a administradores
 */
export const adminOnly = authorize(ROLE_ADMIN);

/**
 * Middleware que permite acceso a clientes y administradores
 */
export const clientOrAdmin = authorize(ROLE_CLIENT, ROLE_ADMIN);
