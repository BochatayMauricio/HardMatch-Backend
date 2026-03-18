import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../utils/errors.js";
import { userService } from "../../core/services/user.service.js";
import { favoritesService } from "../../core/services/favorites.service.js";

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

  async addFavorite(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("No autenticado", {
          resource: "auth",
          action: "addFavorite",
        });
      }

      const { idProduct } = req.body;
      const result = await favoritesService.addFavorite(userId, idProduct);

      res.status(201).json({
        success: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("No autenticado", {
          resource: "auth",
          action: "removeFavorite",
        });
      }

      const idProduct = Number(req.params.idProduct);
      if (!idProduct || isNaN(idProduct)) {
        throw new UnauthorizedError("ID de producto inválido", {
          resource: "product",
          action: "removeFavorite",
        });
      }

      const result = await favoritesService.removeFavorite(userId, idProduct);

      res.status(200).json({
        success: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("No autenticado", {
          resource: "auth",
          action: "getFavorites",
        });
      }

      const limit = Math.min(Number(req.query.limit) || 10, 100); // Máximo 100
      const page = Math.max(Number(req.query.page) || 1, 1);
      const offset = (page - 1) * limit;

      const result = await favoritesService.getFavorites(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: result.favorites,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
