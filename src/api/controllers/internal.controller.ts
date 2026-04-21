// src/controllers/internal.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserPreference } from "../../core/models/UserPreference.js";
import { Notification } from "../../core/models/Notification.js";
import { Op } from "sequelize";

class InternalController {
  async processNewProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Recibimos el producto desde Python (o Postman por ahora)
      const { title, price, brand, category } = req.body;

      // 2. Buscamos a los usuarios a los que les alcanza el presupuesto y buscan esta categoría
      const interestedUsers = await UserPreference.findAll({
        where: {
          newMatchAlert: true,
          maxPrice: { [Op.gte]: price },
          selectedCategories: { [Op.like]: `%${category}%` }
        }
      });

      // 3. Filtramos por marca (en memoria)
      const usersToNotify = interestedUsers.filter(pref => {
        // Si no tiene preferencias de marca o está abierto a nuevas, pasa
        if (pref.openToNewBrands || !pref.preferredBrands) return true;
        
        // Si la marca está explícitamente en sus excluidas, lo rebotamos
        if (pref.excludedBrands?.includes(brand)) return false;

        // Si la marca está en sus preferidas, pasa
        return pref.preferredBrands.includes(brand);
      });

      if (usersToNotify.length === 0) {
        res.status(200).json({ success: true, message: "No hubo matches para este producto." });
        return;
      }

      // 4. Armamos el array de notificaciones para insertar en la BD
      const notifications = usersToNotify.map(pref => ({
        userId: pref.userId,
        title: '🔥 ¡Nuevo Match Encontrado!',
        explanation: `Encontramos ${title} a $${price} en la categoría ${category}.`,
        isRead: false
      }));

      // 5. Inserción masiva en la tabla (muy rápido y eficiente)
      await Notification.bulkCreate(notifications);

      res.status(201).json({ 
        success: true, 
        message: `Notificaciones creadas exitosamente para ${notifications.length} usuarios.` 
      });

    } catch (error) {
      next(error);
    }
  }
}

export const internalController = new InternalController();