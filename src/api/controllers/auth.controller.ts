import type { Request, Response, NextFunction } from "express";
import { authService } from "../../core/services/auth.service.js";
import { UnauthorizedError } from "../../utils/errors.js";

class AuthController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);

      res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("No autenticado", {
          resource: "auth",
          action: "getProfile",
        });
      }

      const user = await authService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("No autenticado", {
          resource: "auth",
          action: "changePassword",
        });
      }

      await authService.changePassword(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
