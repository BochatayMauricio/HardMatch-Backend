// src/core/interfaces/product.interface.ts

export interface ProductFilters {
    search?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    brandId?: number | undefined;
    categoryId?: number | undefined;
}