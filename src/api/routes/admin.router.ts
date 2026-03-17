import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/auth.middleware.js";
import { adminController } from "../controllers/admin.controller.js";
import { reportController } from "../controllers/report.controller.js";

const router = Router();

router.get(
  "/users",
  authenticate,
  adminOnly,
  adminController.getAllUsers.bind(adminController),
);

router.post(
  "/users",
  authenticate,
  adminOnly,
  adminController.createUser.bind(adminController),
);

router.put(
  "/users/:id",
  authenticate,
  adminOnly,
  adminController.updateUser.bind(adminController),
);

router.delete(
  "/users/:id",
  authenticate,
  adminOnly,
  adminController.deleteUser.bind(adminController),
);

// ==================== RUTAS DE REPORTES ====================

router.get(
  "/reports/general-stats",
  authenticate,
  adminOnly,
  reportController.getGeneralStats.bind(reportController),
);

router.get(
  "/reports/top-favorites",
  authenticate,
  adminOnly,
  reportController.getTopFavoriteProducts.bind(reportController),
);

router.get(
  "/reports/top-searches",
  authenticate,
  adminOnly,
  reportController.getTopSearches.bind(reportController),
);

router.get(
  "/reports/top-recommendations",
  authenticate,
  adminOnly,
  reportController.getTopRecommendations.bind(reportController),
);

export default router;
