import { Request, Response, NextFunction } from 'express';
import * as productService from '../../core/services/product.service.js';
import { Store } from '../../core/models/Store.js';
import { ProductFilters, ScraperSyncParams } from '../../core/interfaces/product.interfaces.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { Op } from 'sequelize';

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
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 12;

        console.log('\n--- 🔍 NUEVA BÚSQUEDA ---');
        console.log('Query Params crudos:', req.query);

        const filters: any = {
            search: req.query.search as string | undefined,
            minPrice: req.query.minPrice !== undefined && req.query.minPrice !== '' ? Number(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice !== undefined && req.query.maxPrice !== '' ? Number(req.query.maxPrice) : undefined,
            brandName: req.query.brandName as string | undefined,
            sortBy: req.query.sortBy as string | undefined
        };

        if (req.query.categoryNames) {
            filters.categoryNames = (req.query.categoryNames as string).split(',');
        }

        const responseData = await productService.listProducts(filters, page, limit);

        const uniqueBrands = Array.from(
            new Set(
                responseData.data
                    .map((p: any) => p.brand?.name)
                    .filter((name: any) => name != null)
            )
        ).sort();

        res.status(200).json({ 
            success: true, 
            message: 'Productos obtenidos con éxito', 
            data: {
                ...responseData,
                brands: uniqueBrands // <-- Devolvemos las marcas al frontend
            }
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

const setStoreStatus = async (storeNameKeyword: string, status: string) => {
    try {
        // Buscamos la tienda que contenga la palabra clave (ej: 'MercadoLibre' -> LIKE '%mercado%')
        const store = await Store.findOne({
            where: {
                name: {
                    [Op.like]: `%${storeNameKeyword}%`
                }
            }
        });
        
        if (store) {
            store.status = status;
            if (status === 'Online') {
                store.lastSync = new Date();
            }
            await store.save();
        }
    } catch (error) {
        console.error(`Error actualizando estado de la tienda ${storeNameKeyword}:`, error);
    }
};

// --- CONTROLADOR 1: MEJORES DESCUENTOS ---
export const getTopDiscountsData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const user = (req as any).user; 
        let limit = 0;
        if(user){
            limit = 8;
        } else
            limit = 16;
        const responseData = await productService.getTopDiscounts(page, limit);

        res.status(200).json({ 
            success: true, 
            message: 'Mejores descuentos obtenidos',
            data: responseData 
        });
    } catch (error) {
        next(error);
    }
};

// --- CONTROLADOR 2: RECOMENDADOS ---
export const getRecommendedData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 8) || 8;
        
        // El middleware authenticate ya hizo su magia.
        // Extraemos el ID del usuario (casteamos a 'any' por si Express no tiene tipado 'user')
        const user = (req as any).user; 
        const rawUserId = user?.id || user?.userId;
        const userId = rawUserId ? parseInt(rawUserId, 10) : null; // Ajustá esto según cómo tu middleware guarde el ID

        // Si por alguna razón el middleware dejó pasar la request pero no hay ID
        if (!userId || isNaN(userId)) {
            res.status(200).json({ 
                success: true, 
                message: 'Usuario no identificado, no hay recomendaciones',
                data: { data: [], totalItems: 0, totalPages: 0, currentPage: page } 
            });
            return;
        }

        // Llamamos al servicio con la seguridad de que userId existe
        const responseData = await productService.getRecommended(page, limit, userId);

        res.status(200).json({ 
            success: true, 
            message: 'Recomendaciones obtenidas',
            data: responseData 
        });
    } catch (error) {
        next(error);
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

        await setStoreStatus('mercado', 'Procesando');

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

            await setStoreStatus('mercado', 'Online');
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
            try {
                // 💡 1. Ponemos la tienda en "Procesando..."
                await Store.update(
                    { status: 'Procesando...' }, 
                    { where: { name: { [Op.like]: '%Compra Gamer%' } } }
                );

                console.log(`[ScraperBackground] Iniciando lote de ${queries.length} queries en CompraGamer...`);
                
                for (const query of queries) {
                    try {
                        const payload = { query, maxPages };
                        console.log(`[ScraperBackground] Procesando en CG: "${query}"`);
                        
                        await productService.syncProductsFromScraperByCompraGamer(payload);
                        
                        console.log(`[ScraperBackground] ✅ Finalizado CG: "${query}"`);
                    } catch (error) {
                        console.error(`[ScraperBackground] ❌ Error procesando CG "${query}":`, error);
                    }
                }
                
                console.log(`[ScraperBackground] Lote de CompraGamer finalizado.`);
                
                // 💡 2. Terminó todo bien, pasamos a "Online" y guardamos la fecha
                await Store.update(
                    { status: 'Online', lastSync: new Date() }, 
                    { where: { name: { [Op.like]: '%Compra Gamer%' } } }
                );

            } catch (fatalError) {
                console.error('[ScraperBackground] ❌ Error fatal en lote CG:', fatalError);
                // 💡 3. Si falla todo el proceso, lo marcamos como Error
                await Store.update(
                    { status: 'Error' }, 
                    { where: { name: { [Op.like]: '%Compra Gamer%' } } }
                );
            }
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

        res.status(202).json({
            success: true,
            message: 'Sincronización de Venex iniciada en segundo plano. Esto demorará unos minutos.'
        });

        (async () => {
            try {
                // 💡 1. Actualizamos estado a Procesando
                await Store.update(
                    { status: 'Procesando...' }, 
                    { where: { name: { [Op.like]: '%Venex%' } } }
                );

                console.log(`[ScraperBackground] Iniciando lote de ${queries.length} queries en Venex...`);
                
                for (const query of queries) {
                    try {
                        const payload = { query, maxPages };
                        console.log(`[ScraperBackground] Procesando en Venex: "${query}"`);
                        
                        await productService.syncProductsFromScraperByVenex(payload);
                        
                        console.log(`[ScraperBackground] ✅ Finalizado Venex: "${query}"`);
                    } catch (error) {
                        console.error(`[ScraperBackground] ❌ Error procesando Venex "${query}":`, error);
                    }
                }
                
                console.log(`[ScraperBackground] Lote de Venex finalizado.`);
                
                // 💡 2. Pasamos a Online
                await Store.update(
                    { status: 'Online', lastSync: new Date() }, 
                    { where: { name: { [Op.like]: '%Venex%' } } }
                );

            } catch (fatalError) {
                console.error('[ScraperBackground] ❌ Error fatal en lote Venex:', fatalError);
                // 💡 3. Pasamos a Error
                await Store.update(
                    { status: 'Error' }, 
                    { where: { name: { [Op.like]: '%Venex%' } } }
                );
            }
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

        res.status(202).json({
            success: true,
            message: 'Sincronización de Fravega iniciada en segundo plano. Esto demorará unos minutos.'
        });

        (async () => {
            try {
                // 💡 1. Actualizamos estado a Procesando
                await Store.update(
                    { status: 'Procesando...' }, 
                    { where: { name: { [Op.like]: '%Fravega%' } } }
                );

                console.log(`[ScraperBackground] Iniciando lote de ${queries.length} queries en Fravega...`);
                
                for (const query of queries) {
                    try {
                        const payload = { query, maxPages };
                        console.log(`[ScraperBackground] Procesando en Fravega: "${query}"`);
                        
                        await productService.syncProductsFromScraperByFravega(payload);
                        
                        console.log(`[ScraperBackground] ✅ Finalizado Fravega: "${query}"`);
                    } catch (error) {
                        console.error(`[ScraperBackground] ❌ Error procesando Fravega "${query}":`, error);
                    }
                }
                
                console.log(`[ScraperBackground] Lote de Fravega finalizado.`);
                
                // 💡 2. Pasamos a Online
                await Store.update(
                    { status: 'Online', lastSync: new Date() }, 
                    { where: { name: { [Op.like]: '%Fravega%' } } }
                );

            } catch (fatalError) {
                console.error('[ScraperBackground] ❌ Error fatal en lote Fravega:', fatalError);
                // 💡 3. Pasamos a Error
                await Store.update(
                    { status: 'Error' }, 
                    { where: { name: { [Op.like]: '%Fravega%' } } }
                );
            }
        })();

    } catch (error) {
        next(error);
    }
};