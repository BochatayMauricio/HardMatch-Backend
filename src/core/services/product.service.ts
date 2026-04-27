import axios from 'axios';
import { col, fn, Op, Transaction, where as sequelizeWhere } from 'sequelize';
import config from '../../config/config.js';
import { ConflictError, ValidationError } from '../../utils/errors.js';
import {
    ProductFilters,
    ScrapedFeatureInput,
    ScrapedProductInput,
    ScraperSyncParams,
    ScraperSyncResult
} from '../interfaces/product.interfaces.js';
import { ListingAttributes } from '../models/Listing.js';
import { ProductAttributes } from '../models/Product.js';
import {
    Product,
    Brand,
    Category,
    Feature,
    Listing,
    Store,
    ProductFeature,
    Price,
    sequelize
} from '../models/index.js';
import { processListingMatch } from './matching.service.js';

const DEFAULT_BRAND_NAME = 'Sin marca';
const DEFAULT_CATEGORY_NAME = 'Sin categoría';
const DEFAULT_STORE_NAME = 'Tienda desconocida';
const SCRAPER_TIMEOUT_MS = 300000;

const normalizeText = (value?: string | null): string => {
    return (value ?? '').trim().replace(/\s+/g, ' ');
};

const truncateText = (value: string, maxLength: number): string => {
    if (value.length <= maxLength) return value;
    return value.slice(0, maxLength).trim();
};

const normalizeAndTruncate = (value: string | null | undefined, maxLength: number): string => {
    return truncateText(normalizeText(value), maxLength);
};

const normalizedColumnCondition = (columnName: string, value: string) => {
    return sequelizeWhere(
        fn('LOWER', fn('TRIM', col(columnName))),
        value.toLowerCase()
    );
};

const inferStoreFromUrl = (urlAccess?: string): string | null => {
    const normalizedUrl = normalizeText(urlAccess).toLowerCase();
    if (!normalizedUrl) return null;

    if (normalizedUrl.includes('mercadolibre')) return 'Mercado Libre';
    if (normalizedUrl.includes('compragamer')) return 'Compra Gamer';
    if (normalizedUrl.includes('fravega')) return 'Fravega';
    if (normalizedUrl.includes('venex')) return 'Venex';

    return null;
};

const resolveStoreName = (scrapedProduct: ScrapedProductInput): string => {
    const inferredStore = inferStoreFromUrl(scrapedProduct.urlAccess);
    if (inferredStore) return inferredStore;

    const normalizedSeller = normalizeAndTruncate(scrapedProduct.seller, 100);
    if (normalizedSeller) return normalizedSeller;

    return DEFAULT_STORE_NAME;
};

const calculatePercentOff = (
    regularPrice: number | null | undefined,
    currentPrice: number
): number => {
    if (!regularPrice || regularPrice <= 0 || regularPrice <= currentPrice) return 0;

    const percent = ((regularPrice - currentPrice) / regularPrice) * 100;
    return Number(percent.toFixed(2));
};

const parsePrice = (price: unknown): number | null => {
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return null;
    return numericPrice;
};

const fetchScrapedProducts = async (params: ScraperSyncParams): Promise<ScrapedProductInput[]> => {
    const query = normalizeText(params.query);
    if (!query) {
        throw new ValidationError(
            'Datos inválidos para sincronizar scraping',
            [{ field: 'query', message: 'El campo query es obligatorio' }],
            { resource: 'product', action: 'syncProductsFromScraper' }
        );
    }

    const scraperBaseUrl = config.services.scraper.url.replace(/\/+$/, '');
    const endpoint = `${scraperBaseUrl}/all-stores/scrape-by-query`;

    try {
        const response = await axios.get(endpoint, {
            params: {
                q: query,
                max_pages: params.maxPages ?? 1
            },
            timeout: SCRAPER_TIMEOUT_MS
        });

        if (!Array.isArray(response.data)) {
            throw new ConflictError(`El microservicio de scraping no devolvió un array de productos`, {
                resource: "Product",
                action: "Scraper",
            });
        }

        return response.data as ScrapedProductInput[];
    } catch (error) {
        throw new ConflictError(`No se pudo consumir el microservicio de scraping`, {
            resource: "Product",
            action: "Scraper",
        });
    }
};

const fetchScrapedProductsByMercadoLibre = async (params: ScraperSyncParams): Promise<ScrapedProductInput[]>=>{
    const query = normalizeText(params.query);
    if (!query) {
        throw new ValidationError(
            'Datos inválidos para sincronizar scraping',
            [{ field: 'query', message: 'El campo query es obligatorio' }],
            { resource: 'product', action: 'syncProductsFromScraper' }
        );
    }

    const scraperBaseUrl = config.services.scraper.url.replace(/\/+$/, '');
    const endpoint = `${scraperBaseUrl}/mercadolibre/scrape-by-query`;

    try {
        const response = await axios.get(endpoint, {
            params: {
                q: query,
                max_pages: params.maxPages ?? 1
            },
            timeout: SCRAPER_TIMEOUT_MS
        });

        console.log(`[ProductService] Scraper MercadoLibre response for query "${query}":`, response.data);

        if (!Array.isArray(response.data)) {
            throw new ConflictError(`El microservicio de scraping no devolvió un array de productos`, {
                resource: "Product",
                action: "Scraper",
            });
        }

        return response.data as ScrapedProductInput[];
    } catch (error) {
        throw new ConflictError(`No se pudo consumir el microservicio de scraping`, {
            resource: "Product",
            action: "Scraper",
        });
    }
}

const getOrCreateBrand = async (
    rawName: string | null | undefined,
    rawDescription: string | null | undefined,
    transaction: Transaction
): Promise<{ brand: Brand; created: boolean }> => {
    const brandName = normalizeAndTruncate(rawName || DEFAULT_BRAND_NAME, 100);

    let brand = await Brand.findOne({
        where: normalizedColumnCondition('name', brandName),
        transaction
    });

    if (brand) {
        const updateData: { isActive?: boolean; description?: string } = {};

        if (!brand.isActive) {
            updateData.isActive = true;
        }

        const normalizedDescription = normalizeAndTruncate(rawDescription, 500);
        if (normalizedDescription && !brand.description) {
            updateData.description = normalizedDescription;
        }

        if (Object.keys(updateData).length > 0) {
            await brand.update(updateData, { transaction });
        }

        return { brand, created: false };
    }

    const brandPayload: { name: string; description?: string; isActive: boolean } = {
        name: brandName,
        isActive: true
    };

    const normalizedDescription = normalizeAndTruncate(rawDescription, 500);
    if (normalizedDescription) {
        brandPayload.description = normalizedDescription;
    }

    brand = await Brand.create(brandPayload, { transaction });
    return { brand, created: true };
};

const getOrCreateCategory = async (
    rawName: string | null | undefined,
    transaction: Transaction
): Promise<{ category: Category; created: boolean }> => {
    const categoryName = normalizeAndTruncate(rawName || DEFAULT_CATEGORY_NAME, 100);

    let category = await Category.findOne({
        where: normalizedColumnCondition('name', categoryName),
        transaction
    });

    if (category) {
        if (!category.isActive) {
            await category.update({ isActive: true }, { transaction });
        }
        return { category, created: false };
    }

    category = await Category.create({ name: categoryName, isActive: true }, { transaction });
    return { category, created: true };
};

const getOrCreateStore = async (
    rawName: string,
    transaction: Transaction
): Promise<{ store: Store; created: boolean }> => {
    const storeName = normalizeAndTruncate(rawName || DEFAULT_STORE_NAME, 100);

    let store = await Store.findOne({
        where: normalizedColumnCondition('name', storeName),
        transaction
    });

    if (store) {
        if (!store.isActive) {
            await store.update({ isActive: true }, { transaction });
        }
        return { store, created: false };
    }

    store = await Store.create({ name: storeName, isActive: true }, { transaction });
    return { store, created: true };
};

const getOrCreateFeature = async (
    featureInput: ScrapedFeatureInput,
    transaction: Transaction
): Promise<{ feature: Feature | null; created: boolean }> => {
    const keyword = normalizeAndTruncate(featureInput.keyword, 100).toLowerCase();
    const value = normalizeAndTruncate(featureInput.value, 255);

    if (!keyword || !value) {
        return { feature: null, created: false };
    }

    let feature = await Feature.findOne({
        where: {
            [Op.and]: [
                normalizedColumnCondition('keyword', keyword),
                normalizedColumnCondition('value', value)
            ]
        },
        transaction
    });

    if (feature) {
        if (!feature.isActive) {
            await feature.update({ isActive: true }, { transaction });
        }
        return { feature, created: false };
    }

    feature = await Feature.create({ keyword, value, isActive: true }, { transaction });
    return { feature, created: true };
};

interface ListingUpsertInput {
    productId: number;
    storeId: number;
    price: number;
    regularPrice?: number | null;
    urlAccess?: string;
}

interface ListingUpsertResult {
    created: boolean;
    updated: boolean;
    listingForMatch: ListingAttributes | null;
}

const upsertListing = async (
    input: ListingUpsertInput,
    transaction: Transaction
): Promise<ListingUpsertResult> => {
    const normalizedUrl = normalizeAndTruncate(input.urlAccess, 500);
    const percentOff = calculatePercentOff(input.regularPrice, input.price);

    const listingPayload: {
        productId: number;
        storeId: number;
        priceTotal: number;
        percentOff: number;
        isActive: boolean;
        urlAccess?: string;
    } = {
        productId: input.productId,
        storeId: input.storeId,
        priceTotal: input.price,
        percentOff,
        isActive: true
    };

    if (normalizedUrl) {
        listingPayload.urlAccess = normalizedUrl;
    }

    const existingListing = await Listing.findOne({
        where: { productId: input.productId, storeId: input.storeId },
        order: [['updatedAt', 'DESC']],
        transaction
    });

    if (!existingListing) {
        const createdListing = await Listing.create(listingPayload, { transaction });

        await Price.create(
            {
                price: input.price,
                idProduct: input.productId
            },
            { transaction }
        );

        return {
            created: true,
            updated: false,
            listingForMatch: createdListing.toJSON() as ListingAttributes
        };
    }

    const previousPrice = Number(existingListing.priceTotal);
    const previousPercent = Number(existingListing.percentOff ?? 0);
    const previousUrl = normalizeAndTruncate(existingListing.urlAccess, 500);

    const hasPriceChanged = previousPrice !== input.price;
    const hasPercentChanged = previousPercent !== percentOff;
    const hasUrlChanged = normalizedUrl ? previousUrl !== normalizedUrl : false;
    const shouldReactivate = !existingListing.isActive;

    if (!hasPriceChanged && !hasPercentChanged && !hasUrlChanged && !shouldReactivate) {
        return { created: false, updated: false, listingForMatch: null };
    }

    await existingListing.update(listingPayload, { transaction });

    if (hasPriceChanged) {
        await Price.create(
            {
                price: input.price,
                idProduct: input.productId
            },
            { transaction }
        );
    }

    return {
        created: false,
        updated: true,
        listingForMatch: hasPriceChanged
            ? (existingListing.toJSON() as ListingAttributes)
            : null
    };
};


const processProductScrapedDate = async (scrapedProducts: ScrapedProductInput[])=>{
    const result: ScraperSyncResult = {
        totalFetched: scrapedProducts.length,
        processed: 0,
        createdProducts: 0,
        updatedProducts: 0,
        createdListings: 0,
        updatedListings: 0,
        createdBrands: 0,
        createdCategories: 0,
        createdStores: 0,
        createdFeatures: 0,
        errors: []
    };

    for (const scrapedProduct of scrapedProducts) {
        const productName = normalizeAndTruncate(scrapedProduct.name, 255) || 'Producto sin nombre';
        const parsedPrice = parsePrice(scrapedProduct.price);

        if (!parsedPrice) {
            result.errors.push({
                productName,
                reason: 'Precio inválido o menor/igual a cero'
            });
            continue;
        }

        if (!normalizeText(scrapedProduct.name)) {
            result.errors.push({
                productName,
                reason: 'Nombre de producto vacío'
            });
            continue;
        }

        let listingForMatch: ListingAttributes | null = null;

        const itemCounters = {
            createdProducts: 0,
            updatedProducts: 0,
            createdListings: 0,
            updatedListings: 0,
            createdBrands: 0,
            createdCategories: 0,
            createdStores: 0,
            createdFeatures: 0
        };

        try {
            await sequelize.transaction(async (transaction) => {
                const brandInfo = await getOrCreateBrand(
                    scrapedProduct.brand?.name,
                    scrapedProduct.brand?.description,
                    transaction
                );
                if (brandInfo.created) itemCounters.createdBrands += 1;

                const categoryInfo = await getOrCreateCategory(scrapedProduct.category, transaction);
                if (categoryInfo.created) itemCounters.createdCategories += 1;

                const normalizedUrl = normalizeAndTruncate(scrapedProduct.urlAccess, 500);
                const normalizedImageUrl = normalizeAndTruncate(scrapedProduct.imageUrl, 2000);

                console.log(`[ScraperJob] Processing product: ${productName}`);

                const existingProduct = await Product.findOne({
                    where: normalizedColumnCondition('name', productName),
                    transaction
                });
                
                let productId: number;
                if (existingProduct) {
                    const updatePayload: Partial<ProductAttributes> = {
                        price: parsedPrice,
                        brandId: brandInfo.brand.id,
                        categoryId: categoryInfo.category.id,
                        isActive: true
                    };

                    if (normalizedUrl) {
                        updatePayload.urlAccess = normalizedUrl;
                    }

                    if (normalizedImageUrl) {
                        updatePayload.imageUrl = normalizedImageUrl;
                    }

                    await existingProduct.update(updatePayload, { transaction });
                    productId = existingProduct.id;
                    itemCounters.updatedProducts += 1;
                } else {
                    const productPayload: Omit<ProductAttributes, 'id'> = {
                        name: productName,
                        price: parsedPrice,
                        brandId: brandInfo.brand.id,
                        categoryId: categoryInfo.category.id,
                        isActive: true
                    };

                    if (normalizedUrl) {
                        productPayload.urlAccess = normalizedUrl;
                    }

                    if (normalizedImageUrl) {
                        productPayload.imageUrl = normalizedImageUrl;
                    }

                    const createdProduct = await Product.create(productPayload, { transaction });
                    productId = createdProduct.id;
                    itemCounters.createdProducts += 1;
                }

                const features = Array.isArray(scrapedProduct.features)
                    ? scrapedProduct.features
                    : [];

                console.log(`[ScraperJob] Found ${features.toString()} features for product: ${productName}`);

                const seenFeatureSignatures = new Set<string>();
                for (const featureInput of features) {
                    const keyword = normalizeAndTruncate(featureInput.keyword, 100).toLowerCase();
                    const value = normalizeAndTruncate(featureInput.value, 255).toLowerCase();
                    const signature = `${keyword}::${value}`;

                    if (!keyword || !value || seenFeatureSignatures.has(signature)) {
                        continue;
                    }

                    seenFeatureSignatures.add(signature);

                    const featureInfo = await getOrCreateFeature(featureInput, transaction);
                    if (!featureInfo.feature) continue;

                    if (featureInfo.created) {
                        itemCounters.createdFeatures += 1;
                    }

                    await ProductFeature.findOrCreate({
                        where: { idProduct: productId, idFeature: featureInfo.feature.id },
                        defaults: { idProduct: productId, idFeature: featureInfo.feature.id },
                        transaction
                    });
                }

                const storeInfo = await getOrCreateStore(resolveStoreName(scrapedProduct), transaction);
                if (storeInfo.created) itemCounters.createdStores += 1;

                const listingInput: ListingUpsertInput = {
                    productId,
                    storeId: storeInfo.store.id,
                    price: parsedPrice
                };

                if (scrapedProduct.regularPrice !== undefined) {
                    listingInput.regularPrice = scrapedProduct.regularPrice;
                }

                if (scrapedProduct.urlAccess) {
                    listingInput.urlAccess = scrapedProduct.urlAccess;
                }

                const listingSync = await upsertListing(listingInput, transaction);

                if (listingSync.created) itemCounters.createdListings += 1;
                if (listingSync.updated) itemCounters.updatedListings += 1;

                listingForMatch = listingSync.listingForMatch;
            });

            result.processed += 1;
            result.createdProducts += itemCounters.createdProducts;
            result.updatedProducts += itemCounters.updatedProducts;
            result.createdListings += itemCounters.createdListings;
            result.updatedListings += itemCounters.updatedListings;
            result.createdBrands += itemCounters.createdBrands;
            result.createdCategories += itemCounters.createdCategories;
            result.createdStores += itemCounters.createdStores;
            result.createdFeatures += itemCounters.createdFeatures;

            if (listingForMatch) {
                processListingMatch(listingForMatch).catch((error) => {
                    console.error('Error ejecutando matching tras sync de scraping:', error);
                });
            }
        } catch (error) {
            const reason = error instanceof Error ? error.message : 'Error desconocido';

            console.error(`❌ Error crítico guardando ${productName}:`, error);

            result.errors.push({ productName, reason });
        }
    }
}


// Omitimos el 'id' porque la base de datos lo autogenera
export const addProduct = async (data: Omit<ProductAttributes, 'id'>) => {
    const newProduct = await Product.create(data);
    return newProduct;
};

export const listProducts = async (filters: ProductFilters = {}) => {
    const whereClause: any = { isActive: true };

    if (filters.search) {
        whereClause.name = { [Op.like]: `%${filters.search}%` }; 
    }

    if (filters.minPrice || filters.maxPrice) {
        whereClause.price = {};
        if (filters.minPrice) whereClause.price[Op.gte] = filters.minPrice;
        if (filters.maxPrice) whereClause.price[Op.lte] = filters.maxPrice;
    }

    if (filters.brandId) {
        whereClause.brandId = filters.brandId;
    }
    if (filters.categoryId) {
        whereClause.categoryId = filters.categoryId;
    }

    const products = await Product.findAll({
        where: whereClause,
        // 💡 Ahora el catálogo principal también recibe TODA la info anidada
        include: [
            { model: Brand, as: 'brand', attributes: ['name'] },
            { model: Category, as: 'category', attributes: ['name'] },
            { 
                model: Feature, 
                as: 'features', 
                attributes: ['keyword', 'value'], 
                through: { attributes: [] } 
            },
            { 
                model: Listing, 
                as: 'listings', 
                attributes: ['priceTotal', 'urlAccess', 'percentOff'],
                where: { isActive: true },
                required: false,
                // 💡 LA MAGIA DE LA TIENDA:
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'logo']
                    }
                ]
            }
        ]
})
return products
};

// 1. Obtener por ID
export const getProductById = async (id: number) => {
    const product = await Product.findOne({
        where: { id, isActive: true },
        include: [
            { 
                model: Brand, 
                as: 'brand', 
                attributes: ['name'] 
            },
            { 
                model: Category, 
                as: 'category', 
                attributes: ['name'] 
            },
            { 
                model: Feature, 
                as: 'features', 
                attributes: ['keyword', 'value'], 
                through: { attributes: [] } 
            },
            { 
                model: Listing, 
                as: 'listings', 
                attributes: ['priceTotal', 'urlAccess', 'percentOff'],
                where: { isActive: true },
                required: false,
                // 💡 LA MAGIA DE LA TIENDA: Hacemos un include anidado
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'logo']
                    }
                ]
            }
        ]
    });
    return product;
};

// 2. Actualizar un producto
export const updateProduct = async (id: number, data: Partial<ProductAttributes>) => {
    const [affectedRows] = await Product.update(data, {
        where: { id, isActive: true }
    });
    
    if (affectedRows === 0) return null;
    
    return await getProductById(id);
};

// 3. Eliminar (Soft Delete)
export const deleteProduct = async (id: number) => {
    const [affectedRows] = await Product.update(
        { isActive: false }, 
        { where: { id, isActive: true } }
    );
    return affectedRows > 0; // Devuelve true si lo borró, false si no lo encontró
};

// 4. Comparar Productos
export const compareProducts = async (productIds: number[]) => {
    const products = await Product.findAll({
        where: { 
            id: productIds,
            isActive: true 
        },
        include: ['brand', 'category'] 
    });

    // Validamos que se hayan encontrado TODOS los que el usuario pidió
    if (products.length !== productIds.length) {
        throw new Error("Uno o más productos seleccionados no existen o no están disponibles");
    }

    // Aislamos el primer producto para que TypeScript lo evalúe
    const firstProduct = products[0];
    
    // Si por alguna razón extraña no existe, cortamos acá
    if (!firstProduct) {
        throw new Error("Error al obtener el producto principal para comparar");
    }

    const firstCategoryId = firstProduct.toJSON().categoryId;
    
    const allSameCategory = products.every(product => product.toJSON().categoryId === firstCategoryId);

    if (!allSameCategory) {
        throw new Error("No se pueden comparar productos de distintas categorías");
    }

    return products;
};

// 5. Sincronizar productos desde scraper de todas las paginas
export const syncProductsFromScraper = async (
    params: ScraperSyncParams
): Promise<Boolean> => {
    try {
        const scrapedProducts = await fetchScrapedProducts(params);
    
        await processProductScrapedDate(scrapedProducts);

        return true;
    } catch (error) {
        throw new ConflictError(`Error sincronizando productos desde scraper: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
            resource: "Product",
            action: "syncProductsFromScraper",
        });
    }

};

// 6. Sincronizar productos desde scraper de MercadoLibre
export const syncProductsFromScraperByMercadoLibre = async (
    payload: ScraperSyncParams
) => {
    try {
        const scrapedProducts = await fetchScrapedProductsByMercadoLibre(payload);

        console.log(`[ProductService] Scraped ${scrapedProducts.length} products from MercadoLibre for query: "${payload.query}"`);

        await processProductScrapedDate(scrapedProducts);

        return true;
    } catch (error) {
        throw new ConflictError(`Error sincronizando productos desde scraper de MercadoLibre: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
            resource: "Product",
            action: "syncProductsFromScraperByMercadoLibre",
        });
    }
};

const fetchScrapedProductsByCompraGamer = async (params: ScraperSyncParams): Promise<ScrapedProductInput[]> => {
    const query = normalizeText(params.query);
    if (!query) {
        throw new ValidationError(
            'Datos inválidos para sincronizar scraping',
            [{ field: 'query', message: 'El campo query es obligatorio' }],
            { resource: 'product', action: 'syncProductsFromScraperByCompraGamer' }
        );
    }

    const scraperBaseUrl = config.services.scraper.url.replace(/\/+$/, '');
    // Asumimos que crearás un prefijo /compragamer en tu microservicio Python
    const endpoint = `${scraperBaseUrl}/compragamer/scrape-by-query`;

    try {
        const response = await axios.get(endpoint, {
            params: {
                q: query,
                max_pages: params.maxPages ?? 1
            },
            timeout: SCRAPER_TIMEOUT_MS // Recordá que subimos esto a 300000 (5 mins)
        });

        console.log(`[ProductService] Scraper CompraGamer response for query "${query}": recibidos ${response.data.length} items`);

        if (!Array.isArray(response.data)) {
            throw new ConflictError(`El microservicio de scraping no devolvió un array de productos`, {
                resource: "Product",
                action: "ScraperCompraGamer",
            });
        }

        return response.data as ScrapedProductInput[];
    } catch (error) {
        throw new ConflictError(`No se pudo consumir el microservicio de scraping de CompraGamer`, {
            resource: "Product",
            action: "ScraperCompraGamer",
        });
    }
};

export const syncProductsFromScraperByCompraGamer = async (
    payload: ScraperSyncParams
) => {
    try {
        const scrapedProducts = await fetchScrapedProductsByCompraGamer(payload);

        console.log(`[ProductService] Scraped ${scrapedProducts.length} products from CompraGamer for query: "${payload.query}"`);

        // Reutilizamos tu excelente función processProductScrapedDate para normalizar y guardar en DB
        await processProductScrapedDate(scrapedProducts);

        return true;
    } catch (error) {
        throw new ConflictError(`Error sincronizando productos desde scraper de CompraGamer: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
            resource: "Product",
            action: "syncProductsFromScraperByCompraGamer",
        });
    }
};

const fetchScrapedProductsByVenex = async (params: ScraperSyncParams): Promise<ScrapedProductInput[]> => {
    const query = normalizeText(params.query);
    if (!query) {
        throw new ValidationError(
            'Datos inválidos para sincronizar scraping',
            [{ field: 'query', message: 'El campo query es obligatorio' }],
            { resource: 'product', action: 'syncProductsFromScraperByVenex' }
        );
    }

    const scraperBaseUrl = config.services.scraper.url.replace(/\/+$/, '');
    const endpoint = `${scraperBaseUrl}/venex/scrape-by-query`;

    try {
        const response = await axios.get(endpoint, {
            params: {
                q: query,
                max_pages: params.maxPages ?? 1
            },
            timeout: SCRAPER_TIMEOUT_MS // Recordá que esto debe estar en 300000ms (5 min)
        });

        console.log(`[ProductService] Scraper Venex response for query "${query}": recibidos ${response.data.length} items`);

        if (!Array.isArray(response.data)) {
            throw new ConflictError(`El microservicio de scraping no devolvió un array de productos`, {
                resource: "Product",
                action: "ScraperVenex",
            });
        }

        return response.data as ScrapedProductInput[];
    } catch (error) {
        throw new ConflictError(`No se pudo consumir el microservicio de scraping de Venex`, {
            resource: "Product",
            action: "ScraperVenex",
        });
    }
};

// 2. Exportación de la sincronización para el controlador
export const syncProductsFromScraperByVenex = async (
    payload: ScraperSyncParams
) => {
    try {
        const scrapedProducts = await fetchScrapedProductsByVenex(payload);

        console.log(`[ProductService] Scraped ${scrapedProducts.length} products from Venex for query: "${payload.query}"`);

        // Reutilizamos tu función de procesamiento y normalización
        await processProductScrapedDate(scrapedProducts);

        return true;
    } catch (error) {
        throw new ConflictError(`Error sincronizando productos desde scraper de Venex: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
            resource: "Product",
            action: "syncProductsFromScraperByVenex",
        });
    }
};


const fetchScrapedProductsByFravega = async (params: ScraperSyncParams): Promise<ScrapedProductInput[]> => {
    const query = normalizeText(params.query);
    if (!query) {
        throw new ValidationError(
            'Datos inválidos para sincronizar scraping',
            [{ field: 'query', message: 'El campo query es obligatorio' }],
            { resource: 'product', action: 'syncProductsFromScraperByFravega' }
        );
    }

    const scraperBaseUrl = config.services.scraper.url.replace(/\/+$/, '');
    const endpoint = `${scraperBaseUrl}/fravega/scrape-by-query`;

    try {
        const response = await axios.get(endpoint, {
            params: {
                q: query,
                max_pages: params.maxPages ?? 1
            },
            timeout: SCRAPER_TIMEOUT_MS // Recordá que esto debe estar en 300000ms (5 min)
        });

        console.log(`[ProductService] Scraper Fravega response for query "${query}": recibidos ${response.data.length} items`);

        if (!Array.isArray(response.data)) {
            throw new ConflictError(`El microservicio de scraping no devolvió un array de productos`, {
                resource: "Product",
                action: "ScraperFravega",
            });
        }

        return response.data as ScrapedProductInput[];
    } catch (error) {
        throw new ConflictError(`No se pudo consumir el microservicio de scraping de Fravega`, {
            resource: "Product",
            action: "ScraperFravega",
        });
    }
};

export const syncProductsFromScraperByFravega = async (
    payload: ScraperSyncParams
) => {
    try {
        const scrapedProducts = await fetchScrapedProductsByFravega(payload);

        console.log(`[ProductService] Scraped ${scrapedProducts.length} products from Fravega for query: "${payload.query}"`);

        // Reutilizamos tu función de procesamiento y normalización
        await processProductScrapedDate(scrapedProducts);

        return true;
    } catch (error) {
        throw new ConflictError(`Error sincronizando productos desde scraper de Fravega: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
            resource: "Product",
            action: "syncProductsFromScraperByFravega",
        });
    }
};

