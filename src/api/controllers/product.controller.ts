import { Request, Response } from 'express';
import * as productService from '../../core/services/product.service.js';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await productService.addProduct(req.body);
        res.status(201).json({ 
            success: true, 
            message: 'Producto creado exitosamente',
            data: product 
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await productService.listProducts();
        res.status(200).json({ 
            success: true, 
            count: products.length, 
            data: products 
        });
    } catch (error) {
        console.error('Error al listar productos:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
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