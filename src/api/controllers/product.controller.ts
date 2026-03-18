import { Request, Response } from 'express';
import * as productService from '../../core/services/product.service.js';
import { ProductFilters } from '../../core/interfaces/product.interfaces.js';
import { InternalError } from '../../utils/errors.js';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await productService.addProduct(req.body);
        res.status(201).json({ 
            success: true, 
            message: 'Producto creado exitosamente',
            data: product 
        });
    } catch (error) {
         throw new InternalError('Error al crear el producto', {
            resource: 'Product',
            action: 'create',
            details: { body: req.body, error }
        });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        // Le decimos explícitamente a TypeScript que este objeto es de tipo ProductFilters
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
        throw new InternalError('Error al listar productos', {
            resource: 'Product',
            action: 'getAll',
            details: { query: req.query, error }
        })
    }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await productService.getProductById(Number(req.params.id));
        if (!product) {
            res.status(404).json({ success: false, message: 'Producto no encontrado' });
            return;
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

export const update = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedProduct = await productService.updateProduct(Number(req.params.id), req.body);
        if (!updatedProduct) {
            res.status(404).json({ success: false, message: 'Producto no encontrado para actualizar' });
            return;
        }
        res.status(200).json({ success: true, message: 'Producto actualizado', data: updatedProduct });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
    try {
        const isDeleted = await productService.deleteProduct(Number(req.params.id));
        if (!isDeleted) {
            res.status(404).json({ success: false, message: 'Producto no encontrado para eliminar' });
            return;
        }
        res.status(200).json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};