import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../utils/errors.js";
import { userService } from "../../core/services/user.service.js";
import { UserPreference } from "../../core/models/index.js";

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
  
  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("No autenticado");
      }

      await userService.changePassword(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      // Buscamos las preferencias. Si no existen, findOrCreate las crea con los defaults del modelo.
      const [record] = await UserPreference.findOrCreate({
        where: { userId },
        defaults: { userId } as any,
      });

      // REHIDRATACIÓN: Convertimos la fila plana en el objeto estructurado para Angular
      const preferences = {
        id: record.id,
        userId: record.userId,
        selectedCategories: record.selectedCategories ? record.selectedCategories.split(",") : [],
        usageTypes: record.usageTypes ? record.usageTypes.split(",") : [],
        preferredBrands: record.preferredBrands ? record.preferredBrands.split(",") : [],
        excludedBrands: record.excludedBrands ? record.excludedBrands.split(",") : [],
        priorities: record.priorities ? record.priorities.split(",") : [],
        flexibleBudget: record.flexibleBudget,
        openToNewBrands: record.openToNewBrands,
        // Reconstruimos objetos anidados
        priceRange: {
          minPrice: record.minPrice,
          maxPrice: record.maxPrice,
        },
        alerts: {
          priceDropAlert: record.priceDropAlert,
          newMatchAlert: record.newMatchAlert,
          stockAlert: record.stockAlert,
          dealAlert: record.dealAlert,
          alertFrequency: record.alertFrequency,
        },
      };

      res.status(200).json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const data = req.body; // Aquí llega el UserMatchingPreferences desde Angular

      // APLANAMIENTO: Convertimos el objeto complejo en columnas simples para SQL
      const flatData: any = {
        userId,
        selectedCategories: data.selectedCategories?.join(","),
        usageTypes: data.usageTypes?.join(","),
        preferredBrands: data.preferredBrands?.join(","),
        excludedBrands: data.excludedBrands?.join(","),
        priorities: data.priorities?.join(","),
        flexibleBudget: data.flexibleBudget,
        openToNewBrands: data.openToNewBrands,
        // Desanidamos priceRange
        minPrice: data.priceRange?.minPrice,
        maxPrice: data.priceRange?.maxPrice,
        // Desanidamos alerts
        priceDropAlert: data.alerts?.priceDropAlert,
        newMatchAlert: data.alerts?.newMatchAlert,
        stockAlert: data.alerts?.stockAlert,
        dealAlert: data.alerts?.dealAlert,
        alertFrequency: data.alerts?.alertFrequency,
      };

      // Upsert detecta el userId único y decide si hacer UPDATE o INSERT
      await UserPreference.upsert(flatData);

      res.status(200).json({
        success: true,
        message: "Preferencias sincronizadas correctamente",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
