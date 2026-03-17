/**
 * DTOs para reportes
 */

export interface TopProductDTO {
  id: number;
  name: string;
  price: number;
  favoritesCount: number;
  recommendationsCount: number;
}

export interface TopSearchDTO {
  search: string;
  count: number;
  lastSearched: Date;
}

export interface TopRecommendationDTO {
  id: number;
  productId: number;
  productName: string;
  averageScore: number;
  recommendationCount: number;
}

export interface ReportsStatsDTO {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalFavorites: number;
  totalQueries: number;
  totalRecommendations: number;
  generatedAt: Date;
}

export interface ReportQueryFilterDTO {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  limit?: number | undefined;
}

export interface TopProductsReportDTO {
  title: string;
  description: string;
  generatedAt: Date;
  data: TopProductDTO[];
  totalRecords: number;
}

export interface TopSearchesReportDTO {
  title: string;
  description: string;
  generatedAt: Date;
  data: TopSearchDTO[];
  totalRecords: number;
}

export interface TopRecommendationsReportDTO {
  title: string;
  description: string;
  generatedAt: Date;
  data: TopRecommendationDTO[];
  totalRecords: number;
}

export interface GeneralStatsReportDTO {
  title: string;
  description: string;
  generatedAt: Date;
  data: ReportsStatsDTO;
}
