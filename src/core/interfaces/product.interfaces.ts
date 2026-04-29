// src/core/interfaces/product.interface.ts

export interface ProductFilters {
    search?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    brandId?: number | undefined;
    categoryId?: number | undefined;
}

export interface ScrapedBrandInput {
    name: string;
    description?: string | null;
}

export interface ScrapedFeatureInput {
    keyword: string;
    value?: string | null;
}

export interface ScrapedProductInput {
    name: string;
    urlAccess?: string;
    imageUrl?: string | null;
    price: number;
    regularPrice?: number | null;
    seller?: string | null;
    brand?: ScrapedBrandInput | null;
    category?: string | null;
    features?: ScrapedFeatureInput[];
}

export interface ScraperSyncParams {
    query: string;
    maxPages?: number;
    includeDetailsMl?: boolean;
}

export interface ScraperSyncError {
    productName: string;
    reason: string;
}

export interface ScraperSyncResult {
    totalFetched: number;
    processed: number;
    createdProducts: number;
    updatedProducts: number;
    createdListings: number;
    updatedListings: number;
    createdBrands: number;
    createdCategories: number;
    createdStores: number;
    createdFeatures: number;
    errors: ScraperSyncError[];
}