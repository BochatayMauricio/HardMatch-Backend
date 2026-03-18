import { NextFunction, Request, Response } from 'express';
import * as categoryService from '../../core/services/category.service.js';
import { NotFoundError } from '../../utils/errors.js';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = await categoryService.addCategory(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const categories = await categoryService.listCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = await categoryService.getCategoryById(Number(req.params.id));
        if (!category) {
            throw new NotFoundError('Categoría no encontrada', { 
                resource: 'category', 
                action: 'getById' 
            });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

