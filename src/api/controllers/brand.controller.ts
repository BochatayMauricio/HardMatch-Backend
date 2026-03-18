import { NextFunction, Request, Response } from 'express';
import * as brandService from '../../core/services/brand.service.js';
import { NotFoundError} from "../../utils/errors.js";

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const brand = await brandService.addBrand(req.body);
        res.status(201).json({ success: true, data: brand });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const brands = await brandService.listBrands();
        res.status(200).json({ success: true, data: brands });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const brand = await brandService.getBrandById(Number(req.params.id));
        if (!brand) {
            throw new NotFoundError('Marca no encontrada',{ 
                resource: 'brand', 
                action: 'getById', 
            });
        }
        res.status(200).json({ success: true, data: brand });
    } catch (error) {
        next(error);
    }
};

