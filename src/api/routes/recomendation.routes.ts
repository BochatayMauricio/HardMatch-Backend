import { Router } from "express";
import { recommendationController } from "../controllers/recomendation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js"; // Ajustá la ruta según tu proyecto

const router = Router();

// El usuario logueado pide sus propias recomendaciones
router.get(
  "/my-recommendations", 
  authenticate, 
  recommendationController.getMyRecommendations
);

// Solo el admin puede forzar la generación (útil para debuggear sin esperar al Cron)
router.post(
  "/generate", 
  authenticate, 
  recommendationController.triggerGeneration
);

export default router;