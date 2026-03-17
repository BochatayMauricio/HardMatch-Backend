import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../utils/errors.js";
import { reportService } from "../../core/services/report.service.js";

class ReportController {

  async getGeneralStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "reports",
          action: "getGeneralStats",
        });
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const report = await reportService.getGeneralStats({
        startDate,
        endDate,
      });

      res.status(200).json({
        success: true,
        message: "Reporte de estadísticas generales generado exitosamente",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopFavoriteProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "reports",
          action: "getTopFavoriteProducts",
        });
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const report = await reportService.getTopFavoriteProducts({
        startDate,
        endDate,
        limit,
      });

      res.status(200).json({
        success: true,
        message: "Reporte de productos favoritos generado exitosamente",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopSearches(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "reports",
          action: "getTopSearches",
        });
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const report = await reportService.getTopSearches({
        startDate,
        endDate,
        limit,
      });

      res.status(200).json({
        success: true,
        message: "Reporte de búsquedas generado exitosamente",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopRecommendations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "reports",
          action: "getTopRecommendations",
        });
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const report = await reportService.getTopRecommendations({
        startDate,
        endDate,
        limit,
      });

      res.status(200).json({
        success: true,
        message: "Reporte de recomendaciones generado exitosamente",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
