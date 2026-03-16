import { Request, Response } from 'express';
import * as listingService from '../../core/services/listing.service.js';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const listing = await listingService.addListing(req.body);
        res.status(201).json({ success: true, data: listing });
    } catch (error) {
        console.error('Error al crear listing:', error);
        res.status(500).json({ success: false, message: 'Error al registrar la oferta' });
    }
};

export const getByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const listings = await listingService.getListingsByProduct(Number(req.params.productId));
        res.status(200).json({ success: true, count: listings.length, data: listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener ofertas' });
    }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const history = await listingService.getPriceHistory(Number(req.params.productId));
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el historial de precios' });
    }
};