import { NextFunction, Request, Response } from 'express';
import * as listingService from '../../core/services/listing.service.js';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const listing = await listingService.addListing(req.body);
        res.status(201).json({ success: true, data: listing });
    } catch (error) {
        next(error);
    }
};

export const getByProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const listings = await listingService.getListingsByProduct(Number(req.params.productId));
        res.status(200).json({ success: true, count: listings.length, data: listings });
    } catch (error) {
        next(error);
    }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const history = await listingService.getPriceHistory(Number(req.params.productId));
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        next(error);
    }
};