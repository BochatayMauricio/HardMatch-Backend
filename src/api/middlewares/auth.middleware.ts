import type { Request, Response, NextFunction } from "express";
import { ROLE_ADMIN, ROLE_CLIENT } from "../../config/constants.js";
import { authService } from "../../core/services/auth.service.js";
import type { JwtPayload } from "../../core/interfaces/auth.interfaces.js";
import type { UserAttributes } from "../../core/models/User.js";
import { User } from "../../core/models/User.js";
import { verifyToken } from "../../core/tools/VerifyJwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      token?: string;
    }
  }
}

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

    const decoded = verifyToken(token);

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

export const authorize = (...allowedRoles: Array<"ADMIN" | "CLIENT">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "No autenticado",
      });
      return;
    }

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

export const adminOnly = authorize(ROLE_ADMIN);
export const clientOrAdmin = authorize(ROLE_CLIENT, ROLE_ADMIN);
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    req.token = token;
  } catch (error) {
  }

  next();
};