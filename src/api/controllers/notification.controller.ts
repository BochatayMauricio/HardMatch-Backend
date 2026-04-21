// src/controllers/notification.controller.ts
import { Request, Response, NextFunction } from "express";
import { Notification } from "../../core/models/Notification.js";

class NotificationController {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const notifications = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']] // Las más nuevas primero
      });
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      await Notification.update({ isRead: true }, { where: { id, userId } });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
export const notificationController = new NotificationController();