import { Request, Response } from 'express';
import * as brandService from '../../core/services/brand.service.js';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const brand = await brandService.addBrand(req.body);
        res.status(201).json({ success: true, data: brand });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear la marca' });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const brands = await brandService.listBrands();
        res.status(200).json({ success: true, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener marcas' });
    }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
    try {
        const brand = await brandService.getBrandById(Number(req.params.id));
        if (!brand) {
            res.status(404).json({ success: false, message: 'Marca no encontrada' });
            return;
        }
        res.status(200).json({ success: true, data: brand });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener la marca' });
    }
};

