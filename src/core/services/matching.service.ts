// src/core/services/matching.service.ts
import { Op } from 'sequelize';
import { Product, Brand, Category } from '../models/index.js';
import { UserPreference } from '../models/UserPreference.js';
import { Notification } from '../models/Notification.js';
import { ListingAttributes } from '../models/Listing.js';
import { Favorite } from '../models/Favorite.js';


export const processListingMatch = async (newListing: ListingAttributes) => {
    try {
        console.log(`\n--- 🚀 INICIANDO MOTOR DE NOTIFICACIONES POR FAVORITOS ---`);
        console.log(`[Paso 1] Oferta recibida. ID Producto: ${newListing.productId}, Precio: $${newListing.priceTotal}, Descuento: ${newListing.percentOff || 0}%`);

        // Si la oferta no tiene descuento (o es muy bajo), no notificamos para no hacer spam.
        // Podés ajustar este umbral (ej. 5) o sacarlo si querés notificar cualquier actualización.
        const minimumDiscount = 5; 
        if (!newListing.percentOff || newListing.percentOff < minimumDiscount) {
             console.log(`[Aborto] El producto no alcanza el descuento mínimo del ${minimumDiscount}% para notificar.`);
             return;
        }

        const productInstance = await Product.findByPk(newListing.productId, {
            include: [
                { model: Brand, as: 'brand', attributes: ['name'] }
            ]
        });

        if (!productInstance) {
            console.log(`❌ [Fallo] No se encontró el producto ID ${newListing.productId} en la BD.`);
            return;
        }

        const product: any = productInstance.toJSON();
        const productName = product.name || 'Producto Desconocido';
        const brandName = product.brand?.name || '';
        const price = Number(newListing.priceTotal);

        console.log(`[Paso 2] Producto detectado: "${productName}" | Marca: "${brandName}"`);

        // 💡 LA NUEVA MAGIA: Buscamos qué usuarios tienen ESTE producto en sus favoritos
        const usersWithFavorite = await Favorite.findAll({
            where: {
                idProduct: newListing.productId,
                isActive: true
            },
            attributes: ['idUser'],
            raw: true // Traemos data plana para mejor performance
        });

        console.log(`[Paso 3] Usuarios que tienen este producto en Favoritos: ${usersWithFavorite.length}`);

        if (usersWithFavorite.length === 0) return;

        // Extraemos solo los IDs
        const userIds = usersWithFavorite.map((f: any) => f.idUser);

        // 💡 OPCIONAL (Pero recomendado): Verificar si el usuario quiere recibir alertas. 
        // Si no querés chequear la tabla UserPreference acá, podés volar esta parte y notificar a todos los de 'userIds'
        const usersToNotify = await UserPreference.findAll({
            where: {
                userId: { [Op.in]: userIds },
                priceDropAlert: true // Solo notificamos si el usuario no apagó las alertas de bajada de precio
            },
            attributes: ['userId'],
            raw: true
        });

        console.log(`[Paso 4] Usuarios finales a notificar (tienen alertas activadas): ${usersToNotify.length}`);

        if (usersToNotify.length === 0) return;

        // Armamos el array de notificaciones
        const notificationsToCreate = usersToNotify.map((pref: any) => ({
            userId: pref.userId,
            title: `🔥 ¡Oferta en tus Favoritos!`,
            explanation: `¡Gran noticia! "${productName}" ahora tiene un ${newListing.percentOff}% de descuento y está a $${price}. ¡Aprovechá la oferta!`,
            isRead: false,
            actionUrl: `/producto/${product.id}`
        }));

        await Notification.bulkCreate(notificationsToCreate);
        console.log(`✅ [ÉXITO] Se crearon ${notificationsToCreate.length} notificaciones en la BD.`);
        console.log(`----------------------------------------\n`);

    } catch (error) {
        console.error('❌ [ERROR FATAL en Matching/Notificaciones Engine]:', error);
    }
};