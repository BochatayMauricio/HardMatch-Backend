import type { Request, Response, NextFunction } from "express";
import { authService } from "../../core/services/auth.service.js";
import { UnauthorizedError } from "../../utils/errors.js";
import { userService } from "../../core/services/user.service.js";

class UserController {
  async modifyProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("No autenticado", {
          resource: "auth",
          action: "modifyProfile",
        });
      }
      const result = await userService.modifyProfile(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Perfil actualizado exitosamente",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = Number(req.params.id);

      if (!userId || isNaN(userId)) {
        throw new UnauthorizedError("ID de usuario inválido", {
          resource: "user",
          action: "getUserById",
        });
      }

      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
