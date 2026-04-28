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

  async getWeeklyTraffic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Llamamos al servicio que cuenta los clics por día
      const trafficData = await reportService.getWeeklyTraffic();
      
      // Devolvemos directamente el array de números [0, 15, 20, 0, 0, 0, 0]
      // que es exactamente lo que espera tu `this.http.get<number[]>` en Angular
      res.status(200).json(trafficData);
      
    } catch (error) {
      console.error("❌ [ReportController] Error obteniendo tráfico:", error);
      next(error);
    }
  }

  async getScraperStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("No autenticado", {
          resource: "reports",
          action: "getScraperStats",
        });
      }

      // Opcional: Podés agregar validación para que solo ROLE_ADMIN vea esto
      if (req.user.role !== 'ADMIN') {
         throw new UnauthorizedError("No tienes permisos de administrador", {
          resource: "reports",
          action: "getScraperStats",
        });
      }

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const report = await reportService.getScraperStats({ startDate, endDate });

      res.status(200).json({
        success: true,
        message: "Reporte de scraper generado exitosamente",
        data: report.data, // Enviamos directamente el objeto 'data' para el front
      });
    } catch (error) {
      next(error);
    }
  }

  async getMarketplaceStatuses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new UnauthorizedError("Acceso denegado");
    }

    const statuses = await reportService.getMarketplaceStatuses();

    res.status(200).json({
      success: true,
      data: statuses
    });
  } catch (error) {
    next(error);
  }
}
}

export const reportController = new ReportController();
