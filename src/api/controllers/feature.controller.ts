import { Request, Response } from 'express';
import * as featureService from '../../core/services/feature.service.js';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const feature = await featureService.addFeature(req.body);
        res.status(201).json({ success: true, data: feature });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear la característica' });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const features = await featureService.listFeatures();
        res.status(200).json({ success: true, data: features });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener características' });
    }
};

export const assignToProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const idProduct = Number(req.params.productId);
        const { idFeature } = req.body;

        const result = await featureService.assignFeatureToProduct(idProduct, idFeature);
        
        if (!result.created) {
            res.status(400).json({ success: false, message: 'La característica ya estaba asignada a este producto' });
            return;
        }

        res.status(201).json({ success: true, message: 'Característica asignada correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al asignar la característica' });
    }
};

export const getByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const features = await featureService.getFeaturesByProduct(Number(req.params.productId));
        res.status(200).json({ success: true, data: features });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener características del producto' });
    }
};