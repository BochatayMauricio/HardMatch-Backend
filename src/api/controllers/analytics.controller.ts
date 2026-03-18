import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../../core/services/analytics.service.js';
import { NotFoundError } from '../../utils/errors.js';

export const handleRedirect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { listingId } = req.params; 
    
    try {
        const userId = (req as any).user?.userId || null;
        const url = await analyticsService.trackAndRedirect(Number(listingId), userId);

        res.redirect(302, url!);
        
    } catch (error: any) {
        if (error.message.includes("no encontrada")) {
            // 2. Ahora sí lo reconoce y lo convertimos a número para estar seguros
            next(new NotFoundError(error.message, { resource: "listing", resourceId: Number(listingId) }));
        } else {
            next(error);
        }
    }
};