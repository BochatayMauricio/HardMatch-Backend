import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../utils/errors.js";
import { recommendationService } from "../../core/services/recomendation.service.js";

class RecommendationController {

  async getMyRecommendations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "recommendations",
          action: "getMyRecommendations",
        });
      }

      const user = req.user;
      const idUser = user.userId; 
      const recommendations = await recommendationService.getRecommendationsByUser(idUser);

      res.status(200).json({
        success: true,
        message: "Recomendaciones obtenidas exitosamente",
        data: recommendations,
        count: recommendations.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Endpoint manual para disparar el proceso (opcional, para pruebas)
  async triggerGeneration(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: "No autorizado" });
        return;
      }

      await recommendationService.generateAutomatedRecommendations();

      res.status(200).json({
        success: true,
        message: "Proceso de generación de recomendaciones finalizado"
      });
    } catch (error) {
      next(error);
    }
  }
}

export const recommendationController = new RecommendationController();