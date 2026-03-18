import { Request, Response, NextFunction } from 'express';
import * as productService from '../../core/services/product.service.js';
import { ProductFilters } from '../../core/interfaces/product.interfaces.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

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