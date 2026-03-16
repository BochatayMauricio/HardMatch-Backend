import { Request, Response } from 'express';
import * as categoryService from '../../core/services/category.service.js';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await categoryService.addCategory(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear la categoría' });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await categoryService.listCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener categorías' });
    }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await categoryService.getCategoryById(Number(req.params.id));
        if (!category) {
            res.status(404).json({ success: false, message: 'Categoría no encontrada' });
            return;
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener la categoría' });
    }
};

// ... (Puedes agregar los métodos update y remove siguiendo la misma lógica del productController)