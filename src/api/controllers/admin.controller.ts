import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../../utils/errors.js";
import { ROLE_ADMIN } from "../../config/constants.js";
import { adminService } from "../../core/services/admin.service.js";
import { userService } from "../../core/services/user.service.js";
import type {
  CreateUserDTO,
  UpdateUserDTO,
} from "../../core/interfaces/user.interfaces.js";

class AdminController {

  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "admin",
          action: "getAllUsers",
        });
      }

      // Verificar que sea administrador (el middleware authorize ya lo verifica, pero lo validamos aquí también)
      if (req.user.role !== ROLE_ADMIN) {
        throw new ForbiddenError("No tienes permisos para acceder a esta operación", {
          resource: "admin",
          action: "getAllUsers",
        });
      }

      const users = await adminService.getAllUsers();

      res.status(200).json({
        success: true,
        message: "Listado de usuarios obtenido exitosamente",
        data: users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "admin",
          action: "createUser",
        });
      }

      if (req.user.role !== ROLE_ADMIN) {
        throw new ForbiddenError("No tienes permisos para crear usuarios", {
          resource: "admin",
          action: "createUser",
        });
      }

      const newUser = await adminService.createUser(
        req.body as CreateUserDTO,
      );

      res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "admin",
          action: "updateUser",
        });
      }

      const targetUserId = Number(req.params.id);

      if (!targetUserId || isNaN(targetUserId)) {
        throw new UnauthorizedError("ID de usuario inválido", {
          resource: "admin",
          action: "updateUser",
        });
      }

      // Obtener el usuario a actualizar para validar su rol
      const targetUser = await userService.getUserById(targetUserId);

      // Si el usuario a actualizar es ADMIN, solo puede ser modificado por otro ADMIN
      if (targetUser.role === ROLE_ADMIN && req.user.role !== ROLE_ADMIN) {
        throw new ForbiddenError(
          "Solo administradores pueden modificar a otros administradores",
          {
            resource: "admin",
            action: "updateUser",
          },
        );
      }

      const updatedUser = await adminService.updateUser(
        targetUserId,
        req.body as UpdateUserDTO,
      );

      res.status(200).json({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "admin",
          action: "deleteUser",
        });
      }

      const targetUserId = Number(req.params.id);

      if (!targetUserId || isNaN(targetUserId)) {
        throw new UnauthorizedError("ID de usuario inválido", {
          resource: "admin",
          action: "deleteUser",
        });
      }

      // Obtener el usuario a eliminar para validar su rol
      const targetUser = await userService.getUserById(targetUserId);

      // Si el usuario a eliminar es ADMIN, solo puede ser eliminado por otro ADMIN
      if (targetUser.role === ROLE_ADMIN && req.user.role !== ROLE_ADMIN) {
        throw new ForbiddenError(
          "Solo administradores pueden eliminar a otros administradores",
          {
            resource: "admin",
            action: "deleteUser",
          },
        );
      }

      const result = await adminService.deleteUser(targetUserId);

      res.status(200).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
