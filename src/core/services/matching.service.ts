// src/core/services/matching.service.ts
import { Op } from 'sequelize';
import { Product, Brand, Category } from '../models/index.js';
import { UserPreference } from '../models/UserPreference.js';
import { Notification } from '../models/Notification.js';
import { ListingAttributes } from '../models/Listing.js';

export const processListingMatch = async (newListing: ListingAttributes) => {
    try {
        console.log(`\n--- 🚀 INICIANDO MOTOR DE MATCHING ---`);
        console.log(`[Paso 1] Oferta recibida. ID Producto: ${newListing.productId}, Precio: $${newListing.priceTotal}`);

        const productInstance = await Product.findByPk(newListing.productId, {
            include: [
                { model: Brand, as: 'brand', attributes: ['name'] },
                { model: Category, as: 'category', attributes: ['name'] }
            ]
        });

        if (!productInstance) {
            console.log(`❌ [Fallo] No se encontró el producto ID ${newListing.productId} en la BD.`);
            return;
        }

        // 💡 CORRECCIÓN 1: Convertimos a JSON puro para esquivar el bug de las clases públicas de Sequelize
        const product: any = productInstance.toJSON();

        // 💡 CORRECCIÓN 2: Usamos encadenamiento opcional (?.) y valores por defecto
        const productName = product.name || 'Producto Desconocido';
        const brandName = product.brand?.name || '';
        const categoryName = product.category?.name?.toLowerCase() || '';

        if (!categoryName) {
            console.log(`❌ [Fallo] El producto no tiene categoría o falló el JOIN con la tabla Categories.`);
            return;
        }

        console.log(`[Paso 2] Producto detectado: "${productName}" | Categoría: "${categoryName}" | Marca: "${brandName}"`);

        const price = Number(newListing.priceTotal);

        const interestedUsers = await UserPreference.findAll({
            where: {
                newMatchAlert: true,
                maxPrice: { [Op.gte]: price },
                selectedCategories: { [Op.like]: `%${categoryName}%` }
            }
        });

        console.log(`[Paso 3] Usuarios que pasan el filtro SQL (Presupuesto >= ${price} y buscan '${categoryName}'): ${interestedUsers.length}`);

        if (interestedUsers.length === 0) return;

        const usersToNotify = interestedUsers.filter(pref => {
            const excluded = pref.excludedBrands ? pref.excludedBrands.split(',') : [];
            const preferred = pref.preferredBrands ? pref.preferredBrands.split(',') : [];

            if (excluded.some(b => b.toLowerCase() === brandName.toLowerCase())) {
                console.log(`   -> Usuario ${pref.userId} descartado (Marca Excluida)`);
                return false;
            }
            
            const isPreferred = preferred.some(b => b.toLowerCase() === brandName.toLowerCase());
            if (pref.openToNewBrands || isPreferred) {
                console.log(`   -> Usuario ${pref.userId} APROBADO (Marca ok)`);
                return true;
            }

            console.log(`   -> Usuario ${pref.userId} descartado (No acepta nuevas marcas)`);
            return false;
        });

        console.log(`[Paso 4] Usuarios finales a notificar tras filtro de marca: ${usersToNotify.length}`);

        if (usersToNotify.length === 0) return;

        const notificationsToCreate = usersToNotify.map(pref => ({
            userId: pref.userId,
            title: '🔥 ¡Nueva Oferta Encontrada!',
            explanation: `Encontramos "${productName}" (Marca: ${brandName}) a $${price}. ¡Revisá el catálogo!`,
            isRead: false,
            actionUrl: `/producto/${product.id}`
        }));

        await Notification.bulkCreate(notificationsToCreate);
        console.log(`✅ [ÉXITO] Se crearon ${notificationsToCreate.length} notificaciones en la BD.`);
        console.log(`----------------------------------------\n`);

    } catch (error) {
        console.error('❌ [ERROR FATAL en Matching Engine]:', error);
    }
};