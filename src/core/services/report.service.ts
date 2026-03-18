import { User } from "../models/User.js";
import { Favorite } from "../models/Favorite.js";
import { Query } from "../models/Query.js";
import { Recommendation } from "../models/Recommendation.js";
import { Product } from "../models/Product.js";
import { buildDateFilter } from "../tools/reportHelper.js";
import type {
  TopProductDTO,
  TopSearchDTO,
  TopRecommendationDTO,
  ReportsStatsDTO,
  ReportQueryFilterDTO,
  TopProductsReportDTO,
  TopSearchesReportDTO,
  TopRecommendationsReportDTO,
  GeneralStatsReportDTO,
} from "../interfaces/report.interfaces.js";

class ReportService {

  async getGeneralStats(
    filter?: ReportQueryFilterDTO,
  ): Promise<GeneralStatsReportDTO> {
    const whereClause = buildDateFilter(filter);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalFavorites,
      totalQueries,
      totalRecommendations,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: { isActive: false } }),
      Favorite.count({ where: whereClause }),
      Query.count({ where: whereClause }),
      Recommendation.count({ where: whereClause }),
    ]);

    const stats: ReportsStatsDTO = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalFavorites,
      totalQueries,
      totalRecommendations,
      generatedAt: new Date(),
    };

    return {
      title: "Estadísticas Generales de la Plataforma",
      description: "Resumen de actividad general del sistema",
      generatedAt: new Date(),
      data: stats,
    };
  }

  async getTopFavoriteProducts(
    filter?: ReportQueryFilterDTO,
  ): Promise<TopProductsReportDTO> {
    const limit = filter?.limit || 10;
    const whereClause = buildDateFilter(filter);

    const topProducts = await Favorite.findAll({
      attributes: [
        "idProduct",
        [User.sequelize!.fn("COUNT", User.sequelize!.col("id")), "favoritesCount"],
      ],
      where: whereClause,
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price"],
          required: true,
        },
      ],
      group: ["idProduct", "Product.id"],
      order: [[User.sequelize!.fn("COUNT", User.sequelize!.col("id")), "DESC"]],
      limit,
      subQuery: false,
      raw: true,
    });

    const data: TopProductDTO[] = topProducts.map((item: any) => ({
      id: item["Product.id"],
      name: item["Product.name"],
      price: item["Product.price"],
      favoritesCount: parseInt(item.favoritesCount || 0),
      recommendationsCount: 0, // Se agregará después
    }));

    // Obtener conteo de recomendaciones por producto
    for (const product of data) {
      const recCount = await Recommendation.count({
        where: { idProduct: product.id, ...whereClause },
      });
      product.recommendationsCount = recCount;
    }

    return {
      title: "Top Productos Marcados como Favoritos",
      description: `Top ${limit} productos con más marcas como favoritos`,
      generatedAt: new Date(),
      data,
      totalRecords: data.length,
    };
  }

  async getTopSearches(
    filter?: ReportQueryFilterDTO,
  ): Promise<TopSearchesReportDTO> {
    const limit = filter?.limit || 10;
    const whereClause = buildDateFilter(filter);

    const topSearches = await Query.findAll({
      attributes: [
        "search",
        [User.sequelize!.fn("COUNT", User.sequelize!.col("id")), "count"],
        [
          User.sequelize!.fn("MAX", User.sequelize!.col("createdAt")),
          "lastSearched",
        ],
      ],
      where: whereClause,
      group: ["search"],
      order: [[User.sequelize!.fn("COUNT", User.sequelize!.col("id")), "DESC"]],
      limit,
      raw: true,
    });

    const data: TopSearchDTO[] = topSearches.map((item: any) => ({
      search: item.search,
      count: parseInt(item.count || 0),
      lastSearched: item.lastSearched,
    }));

    return {
      title: "Top Búsquedas Realizadas",
      description: `Top ${limit} términos de búsqueda más frecuentes`,
      generatedAt: new Date(),
      data,
      totalRecords: data.length,
    };
  }

  async getTopRecommendations(
    filter?: ReportQueryFilterDTO,
  ): Promise<TopRecommendationsReportDTO> {
    const limit = filter?.limit || 10;
    const whereClause = buildDateFilter(filter);

    const topRecommendations = await Recommendation.findAll({
      attributes: [
        "id",
        "idProduct",
        [
          User.sequelize!.fn("AVG", User.sequelize!.col("score")),
          "averageScore",
        ],
        [User.sequelize!.fn("COUNT", User.sequelize!.col("id")), "count"],
      ],
      where: whereClause,
      include: [
        {
          model: Product,
          attributes: ["id", "name"],
          required: true,
        },
      ],
      group: ["idProduct", "Product.id"],
      order: [[User.sequelize!.fn("COUNT", User.sequelize!.col("id")), "DESC"]],
      limit,
      subQuery: false,
      raw: true,
    });

    const data: TopRecommendationDTO[] = topRecommendations.map((item: any) => ({
      id: item.id,
      productId: item.idProduct,
      productName: item["Product.name"],
      averageScore: parseFloat(item.averageScore || 0),
      recommendationCount: parseInt(item.count || 0),
    }));

    return {
      title: "Top Recomendaciones",
      description: `Top ${limit} productos más recomendados`,
      generatedAt: new Date(),
      data,
      totalRecords: data.length,
    };
  }
}

export const reportService = new ReportService();
