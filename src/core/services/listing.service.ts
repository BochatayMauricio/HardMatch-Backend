import { ListingClick } from '../interfaces/listingClick.js';
import { Listing, type ListingAttributes } from '../models/Listing.js';
import { Price } from '../models/Price.js';
import { processListingMatch } from './matching.service.js';

export const addListing = async (data: ListingAttributes) => {
    // 1. Creamos la oferta en la tabla listings
    const newListing = await Listing.create(data);

    // 2. Automáticamente guardamos ese precio en el historial (tabla prices)
    await Price.create({
        price: data.priceTotal,
        idProduct: data.productId
    });

    processListingMatch(newListing.toJSON() as ListingAttributes).catch(err => console.error(err));    
    return newListing;
};

export const getListingsByProduct = async (productId: number) => {
    // Traemos todas las ofertas activas de un producto en particular
    return await Listing.findAll({
        where: { productId, isActive: true }
    });
};

export const getPriceHistory = async (productId: number) => {
    // Traemos el historial de precios ordenado del más nuevo al más viejo
    return await Price.findAll({
        where: { idProduct: productId },
        order: [['createdAt', 'DESC']]
    });
};

export const registerClick = async (listingId: number, userId?: number) => {
    // Si userId existe, agrega la propiedad; si es undefined, la omite por completo.
    const newClick = await ListingClick.create({
        listingId,
        ...(userId !== undefined && { userId }) 
    });
    
    return newClick;
};