import { Request, Response } from 'express';
import * as analyticsService from '../../core/services/analytics.service.js';

export const handleRedirect = async (req: Request, res: Response): Promise<void> => {
    try {
        const { listingId } = req.params;
        const userId = (req as any).user?.userId || null;

        const url = await analyticsService.trackAndRedirect(Number(listingId), userId);

        res.redirect(302, url!);
        
    } catch (error: any) {
        console.error("Error en redirección:", error.message);
        // Si falla, lo mandamos a la home de nuestro sitio
        res.redirect('http://localhost:5173/'); 
    }
};