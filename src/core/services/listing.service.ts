import { Listing, type ListingAttributes } from '../models/Listing.js';
import { Price } from '../models/Price.js';

export const addListing = async (data: ListingAttributes) => {
    // 1. Creamos la oferta en la tabla listings
    const newListing = await Listing.create(data);

    // 2. Automáticamente guardamos ese precio en el historial (tabla prices)
    await Price.create({
        price: data.priceTotal,
        idProduct: data.productId
    });

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