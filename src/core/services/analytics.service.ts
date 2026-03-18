import { Listing } from '../models/Listing.js';
import { AuditLog } from '../models/Audit_logs.js';

export const trackAndRedirect = async (listingId: number, userId: number | null) => {
    // 1. Buscamos el listing
    const listing = await Listing.findOne({
        where: { id: listingId, isActive: true }
    });

    if (!listing || !listing.toJSON().urlAccess) {
        throw new Error("Publicación no encontrada o sin URL válida");
    }

    // 2. Creamos el registro en audit_logs
    await AuditLog.create({
        actorUserId: userId || 1,
        targetTable: 'listings', 
        targetRegisterId: listingId,
        action: 'UPDATE', 
        newValue: `Redirect to: ${listing.toJSON().urlAccess}`,
        timestamp: new Date()
    });

    return listing.toJSON().urlAccess;
};