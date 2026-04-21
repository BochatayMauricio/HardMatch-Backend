import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { notificationController } from "../controllers/notification.controller.js";

const router = Router();
router.get(
  "/",
  authenticate,
  notificationController.getMyNotifications.bind(notificationController)
);

// 2. Marcar TODAS como leídas (Debe ir antes que el :id)
router.put(
  "/read-all",
  authenticate,
  notificationController.markAllAsRead.bind(notificationController)
);

// 3. Marcar UNA específica como leída
router.put(
  "/:id/read",
  authenticate,
  notificationController.markAsRead.bind(notificationController)
);

export default router;