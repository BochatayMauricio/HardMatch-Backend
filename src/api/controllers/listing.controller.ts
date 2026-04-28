import { NextFunction, Request, Response } from 'express';
import * as listingService from '../../core/services/listing.service.js';
import { ListingClick } from '../../core/interfaces/listingClick.js';
import { JwtPayload } from '../../core/interfaces/index.js';


interface UserPayload extends JwtPayload {
    id: number;
}

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

export const registerClick = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const listingId = Number(req.params.id);
        
        // Si tenés un middleware de autenticación, sacamos el ID del usuario
        // Usamos optional chaining por si el usuario no está logueado
        console.log("Datos del usuario en el token:", req.user);
        const user = req.user as UserPayload | undefined;
        const userId = user?.userId; 

        // Delegamos al servicio
        await listingService.registerClick(listingId, userId);

        res.status(200).json({ 
            success: true, 
            message: 'Intención de compra registrada exitosamente' 
        });
    } catch (error) {
        // Le pasamos el error a tu manejador global (utils/errors.js)
        next(error);
    }
};