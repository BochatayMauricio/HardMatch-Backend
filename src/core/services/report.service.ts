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
import { Store } from "../models/Store.js";
import { ListingClick } from "../interfaces/listingClick.js";
import { Op } from 'sequelize';
import { Listing } from "../models/Listing.js";


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
        [Favorite.sequelize!.fn("COUNT", Favorite.sequelize!.col("Favorite.id")), "favoritesCount"],
      ],
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ["id", "name", "price"],
          required: true,
        },
      ],
      group: ["idProduct", "product.id"],
      order: [[Favorite.sequelize!.fn("COUNT", Favorite.sequelize!.col("Favorite.id")), "DESC"]],
      limit,
      subQuery: false,
      raw: true,
    });

    const data: TopProductDTO[] = topProducts.map((item: any) => ({
      id: item["product.id"],
      name: item["product.name"],
      price: item["product.price"],
      favoritesCount: parseInt(item.favoritesCount || 0),
      recommendationsCount: 0, // Se agregará después
    }));

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

  // Método para obtener los productos más buscados (Top Searches)
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
        "idProduct",
        [
          Recommendation.sequelize!.fn("AVG", Recommendation.sequelize!.col("score")),
          "averageScore",
        ],
        // Especificamos Recommendation.id para el conteo
        [Recommendation.sequelize!.fn("COUNT", Recommendation.sequelize!.col("Recommendation.id")), "count"],
      ],
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ["id", "name"],
          required: true,
        },
      ],
      group: ["idProduct", "product.id"],
      order: [[Recommendation.sequelize!.fn("COUNT", Recommendation.sequelize!.col("Recommendation.id")), "DESC"]],      limit,
      subQuery: false,
      raw: true,
    });

    const data: TopRecommendationDTO[] = topRecommendations.map((item: any) => ({
      id: item.idProduct,
      productId: item.idProduct,
      productName: item["product.name"],
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

  async getScraperStats(filter?: ReportQueryFilterDTO) {
    const whereClause = buildDateFilter(filter);

    // Ejecutamos las consultas en paralelo para mayor rendimiento
    const [
      totalProducts,
      totalStores,
      totalClicks
    ] = await Promise.all([
      Product.count({ where: whereClause }),
      Store.count(),
      ListingClick.count({ where: whereClause })
    ]);

    // Productos scrapeados hoy (para la métrica del dashboard)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newProductsToday = await Product.count({
      where: {
        createdAt: {
          [Op.gte]: today // Usamos el Op de Sequelize
        }
      }
    });

    return {
      title: "Estadísticas de Scraping y Afiliación",
      description: "Métricas de salud del scraper y conversión de clicks",
      generatedAt: new Date(),
      data: {
        totalSources: totalStores || 5, // Fallback visual
        activeSources: totalStores || 3,
        failedSources: 0,
        totalScrapedProducts: totalProducts,
        newProductsToday: newProductsToday,
        totalClicks: totalClicks
      }
    };
  }
  
  async getWeeklyTraffic(): Promise<number[]> {
    // 1. Calculamos la fecha del lunes de esta semana
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Dom, 1 = Lun, 2 = Mar...
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const startOfWeek = new Date(today.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    // 2. Buscamos los clics desde el lunes hasta hoy
    const clicks = await ListingClick.findAll({
      attributes: [
        // 1. Para las funciones crudas, usamos el nombre literal de la base de datos
        [ListingClick.sequelize!.fn('DAYOFWEEK', ListingClick.sequelize!.col('created_at')), 'day'],
        [ListingClick.sequelize!.fn('COUNT', ListingClick.sequelize!.col('id')), 'count']
      ],
      where: {
        // 2. Para el where, volvemos a usar la propiedad camelCase que TypeScript reconoce
        ['created_at' as any]: {
          [Op.gte]: startOfWeek
        }
      },
      group: ['day'],
      raw: true
    });

    // 3. Preparamos el array para la gráfica: [Lun, Mar, Mié, Jue, Vie, Sáb, Dom]
    const trafficData = [0, 0, 0, 0, 0, 0, 0];
    
    // 4. Llenamos el array con los datos reales de la BD
    clicks.forEach((row: any) => {
      const dbDay = row.day; // Número del 1 al 7
      const count = parseInt(row.count, 10);
      
      // Convertimos el index de MySQL a nuestro index (Lun=0, Mar=1, ..., Dom=6)
      let index = dbDay - 2;
      if (index === -1) index = 6; // Si es domingo (1 - 2 = -1), lo mandamos al final (6)
      
      trafficData[index] = count;
    });

    return trafficData;
  }

  async getMarketplaceStatuses() {
    const stores = await Store.findAll({ raw: true });
    const validStores = stores.filter(s => s !== null && s !== undefined);

    // 💡 1. Calculamos la fecha de ayer por fuera del bucle para no repetirlo
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const statusPromises = validStores.map(async (store: any) => {
      const currentStoreId = store.id; 

      if (currentStoreId === undefined) {
        return null; 
      }

      // 1. Contamos los productos
      const productCount = await Listing.count({ 
        where: { storeId: currentStoreId, isActive: true } 
      });

      // 2A. Obtenemos solo los IDs de los listings que pertenecen a esta tienda
      const storeListings = await Listing.findAll({
        where: { storeId: currentStoreId },
        attributes: ['id'],
        raw: true
      });
      
      const listingIds = storeListings.map((l: any) => l.id);

      // 2B. Contamos los clics donde el listingId esté dentro de nuestro arreglo
      let totalClicks = 0;
      if (listingIds.length > 0) {
        totalClicks = await ListingClick.count({
          where: {
            listingId: { 
              [Op.in]: listingIds
            }
          }
        });
      }

      // --- 💡 NUEVO: CÁLCULO DE VARIACIÓN DE CATÁLOGO ---
      const newProducts = await Listing.count({
          where: { 
              storeId: currentStoreId, 
              createdAt: { [Op.gte]: yesterday } 
          }
      });

      const deactivatedProducts = await Listing.count({
          where: { 
              storeId: currentStoreId, 
              isActive: false,
              updatedAt: { [Op.gte]: yesterday } 
          }
      });

      let growthPercentage = 0;
      let isNegative = false;
      const netChange = newProducts - deactivatedProducts;

      if (productCount > 0) {
          const yesterdayTotal = productCount - netChange; 
          if (yesterdayTotal > 0) {
              growthPercentage = Math.round((Math.abs(netChange) / yesterdayTotal) * 100);
          } else if (netChange > 0) {
              growthPercentage = 100;
          }
      }

      if (netChange < 0) {
          isNegative = true;
      }
      // --------------------------------------------------

      const lastProduct = await Listing.findOne({
        where: { storeId: currentStoreId },
        order: [['updatedAt', 'DESC']],
        raw: true
      });

      // Cálculo de estado artificial (fallback)
      let status = 'OK';
      if (!lastProduct || productCount === 0) status = 'ERROR';
      else {
        const diffHours = (new Date().getTime() - new Date(lastProduct.updatedAt).getTime()) / (1000 * 60 * 60);
        if (diffHours > 24) status = 'WARNING';
      }

      return {
        id: currentStoreId,
        name: store.name || 'Tienda Desconocida',
        logo: store.logo || 'assets/default-store.svg',
        lastUpdate: lastProduct ? lastProduct.updatedAt : new Date(),
        productCount,
        totalClicks,
        // 💡 3. Reemplazamos los valores hardcodeados por las variables calculadas
        avgVariation: growthPercentage,
        priceDrop: isNegative, 
        
        // Priorizamos el estado de la base de datos (Ej: 'Procesando...') y si no hay, usamos el calculado
        status: store.status || status
      };
    });

    const results = await Promise.all(statusPromises);
    return results.filter(r => r !== null);
}
}

export const reportService = new ReportService();
