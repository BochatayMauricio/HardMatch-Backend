import { Request, Response, NextFunction } from 'express';
import * as productService from '../../core/services/product.service.js';
import { ProductFilters, ScraperSyncParams } from '../../core/interfaces/product.interfaces.js';
import { ConflictError, NotFoundError, ValidationError } from '../../utils/errors.js';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const product = await productService.addProduct(req.body);
        res.status(201).json({ 
            success: true, 
            message: 'Producto creado exitosamente',
            data: product 
        });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filters: ProductFilters = {
            search: req.query.search as string | undefined,
            minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
            brandId: req.query.brandId ? Number(req.query.brandId) : undefined,
            categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
        };

        const products = await productService.listProducts(filters);
        
        res.status(200).json({ 
            success: true, 
            count: products.length, 
            data: products 
        });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const product = await productService.getProductById(Number(req.params.id));
        if (!product) {
            throw new NotFoundError('Producto no encontrado', { resource: 'product', resourceId: Number(req.params.id) });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updatedProduct = await productService.updateProduct(Number(req.params.id), req.body);
        if (!updatedProduct) {
            throw new NotFoundError('Producto no encontrado para actualizar', { resource: 'product', resourceId: Number(req.params.id) });
        }
        res.status(200).json({ success: true, message: 'Producto actualizado', data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const isDeleted = await productService.deleteProduct(Number(req.params.id));
        if (!isDeleted) {
            throw new NotFoundError('Producto no encontrado para eliminar', { resource: 'product', resourceId: Number(req.params.id) });
        }
        res.status(200).json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
        next(error);
    }
};

export const compare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { productIds } = req.body;
        const products = await productService.compareProducts(productIds);

        res.status(200).json({ 
            success: true, 
            message: 'Productos obtenidos para comparar',
            data: products 
        });
    } catch (error: any) {
        if (error.message.includes("distintas categorías") || error.message.includes("no existen")) {
             next(new ValidationError(error.message));
        } else {
             next(error);
        }
    }
};

export const syncFromScraper = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const queries: string[] = req.body.queries;
        const maxPages: number = req.body.maxPages || 1;
        const includeDetailsMl: boolean = req.body.includeDetailsMl ?? true;

        // Validación inicial
        if (!queries || !Array.isArray(queries) || queries.length === 0) {
            // Asumo que tenés importado ValidationError igual que en los otros controladores
            throw new ValidationError('El arreglo de queries es requerido y no puede estar vacío');
        }

        // 1. Respondemos INMEDIATAMENTE al frontend
        res.status(202).json({
            success: true,
            message: 'Sincronización de scraping general iniciada en segundo plano. Esto demorará unos minutos.'
        });

        // 2. Ejecutamos la iteración en segundo plano (IIFE)
        (async () => {
            console.log(`[ScraperBackground] Iniciando lote general de ${queries.length} queries...`);
            
            for (const query of queries) {
                try {
                    const payload: ScraperSyncParams = {
                        query,
                        maxPages,
                        includeDetailsMl
                    };
                    console.log(`[ScraperBackground] Procesando general: "${query}"`);
                    
                    // Llamamos a tu servicio original
                    await productService.syncProductsFromScraper(payload);
                    
                    console.log(`[ScraperBackground] ✅ Finalizado general: "${query}"`);
                } catch (error) {
                    // Si falla una query, atrapamos el error acá para que el for...of continúe con la siguiente
                    console.error(`[ScraperBackground] ❌ Error procesando general "${query}":`, error);
                }
            }
            console.log(`[ScraperBackground] Lote general completo finalizado.`);
        })();

    } catch (error) {
        next(error);
    }
};

// Recibe una lista de queries para sincronizar desde MercadoLibre
export const syncFromScraperByMercadoLibre = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const queries: string[] = req.body.queries;
        const maxPages: number = req.body.maxPages || 1;

        // 1. Respondemos INMEDIATAMENTE al frontend
        res.status(202).json({
            success: true,
            message: 'Sincronización de MercadoLibre iniciada en segundo plano. Esto demorará unos minutos.'
        });

        // 2. Ejecutamos el scraping en segundo plano usando una IIFE (Immediately Invoked Function Expression)
        (async () => {
            console.log(`[ScraperBackground] Iniciando lote de ${queries.length} queries...`);
            
            for (const query of queries) {
                try {
                    const payload: ScraperSyncParams = { query, maxPages };
                    console.log(`[ScraperBackground] Procesando: "${query}"`);
                    
                    await productService.syncProductsFromScraperByMercadoLibre(payload);
                    
                    console.log(`[ScraperBackground] ✅ Finalizado: "${query}"`);
                } catch (error) {
                    console.error(`[ScraperBackground] ❌ Error procesando "${query}":`, error);
                }
            }
            console.log(`[ScraperBackground] Lote completo finalizado.`);
        })();

    } catch (error) {
        next(error);
    }
};

export const syncFromScraperByCompraGamer = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const queries: string[] = req.body.queries;
        const maxPages: number = req.body.maxPages || 1;

        if (!queries || !Array.isArray(queries) || queries.length === 0) {
            throw new ValidationError('El arreglo de queries es requerido y no puede estar vacío');
        }

        // Respondemos INMEDIATAMENTE al frontend
        res.status(202).json({
            success: true,
            message: 'Sincronización de CompraGamer iniciada en segundo plano. Esto demorará unos minutos.'
        });

        // Ejecutamos el scraping en segundo plano
        (async () => {
            console.log(`[ScraperBackground] Iniciando lote de ${queries.length} queries en CompraGamer...`);
            
            for (const query of queries) {
                try {
                    const payload: ScraperSyncParams = { query, maxPages };
                    console.log(`[ScraperBackground] Procesando en CG: "${query}"`);
                    
                    await productService.syncProductsFromScraperByCompraGamer(payload);
                    
                    console.log(`[ScraperBackground] ✅ Finalizado CG: "${query}"`);
                } catch (error) {
                    console.error(`[ScraperBackground] ❌ Error procesando CG "${query}":`, error);
                }
            }
            console.log(`[ScraperBackground] Lote de CompraGamer finalizado.`);
        })();

    } catch (error) {
        next(error);
    }
};


// Recibe una lista de queries para sincronizar desde Venex
export const syncFromScraperByVenex = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const queries: string[] = req.body.queries;
        const maxPages: number = req.body.maxPages || 1;

        if (!queries || !Array.isArray(queries) || queries.length === 0) {
            throw new ValidationError('El arreglo de queries es requerido y no puede estar vacío');
        }

        // 1. Respondemos INMEDIATAMENTE al frontend (Fire-and-Forget)
        res.status(202).json({
            success: true,
            message: 'Sincronización de Venex iniciada en segundo plano. Esto demorará unos minutos.'
        });

        // 2. Ejecutamos el scraping en segundo plano
        (async () => {
            console.log(`[ScraperBackground] Iniciando lote de ${queries.length} queries en Venex...`);
            
            for (const query of queries) {
                try {
                    const payload: ScraperSyncParams = { query, maxPages };
                    console.log(`[ScraperBackground] Procesando en Venex: "${query}"`);
                    
                    await productService.syncProductsFromScraperByVenex(payload);
                    
                    console.log(`[ScraperBackground] ✅ Finalizado Venex: "${query}"`);
                } catch (error) {
                    console.error(`[ScraperBackground] ❌ Error procesando Venex "${query}":`, error);
                }
            }
            console.log(`[ScraperBackground] Lote de Venex finalizado.`);
        })();

    } catch (error) {
        next(error);
    }
};

export const syncFromScraperByFravega = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const queries: string[] = req.body.queries;
        const maxPages: number = req.body.maxPages || 1;

        if (!queries || !Array.isArray(queries) || queries.length === 0) {
            throw new ValidationError('El arreglo de queries es requerido y no puede estar vacío');
        }

        // 1. Respondemos INMEDIATAMENTE al frontend (Fire-and-Forget)
        res.status(202).json({
            success: true,
            message: 'Sincronización de Fravega iniciada en segundo plano. Esto demorará unos minutos.'
        });

        // 2. Ejecutamos el scraping en segundo plano
        (async () => {
            console.log(`[ScraperBackground] Iniciando lote de ${queries.length} queries en Fravega...`);
            
            for (const query of queries) {
                try {
                    const payload: ScraperSyncParams = { query, maxPages };
                    console.log(`[ScraperBackground] Procesando en Fravega: "${query}"`);
                    
                    await productService.syncProductsFromScraperByFravega(payload);
                    
                    console.log(`[ScraperBackground] ✅ Finalizado Fravega: "${query}"`);
                } catch (error) {
                    console.error(`[ScraperBackground] ❌ Error procesando Fravega "${query}":`, error);
                }
            }
            console.log(`[ScraperBackground] Lote de Fravega finalizado.`);
        })();

    } catch (error) {
        next(error);
    }
};
