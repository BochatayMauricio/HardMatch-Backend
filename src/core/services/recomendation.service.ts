import { User, Favorite, UserPreference, Recommendation, Product, Category, Brand } from '../models/index.js'; 
import { UserPreferenceAttributes } from '../models/UserPreference.js'
import { Op } from 'sequelize';

export class RecommendationService {
  
  async generateAutomatedRecommendations() {
    const users = await User.findAll({ where: { isActive: true }, raw: true });

    for (const user of users) {
        const userFavorites = await Favorite.findAll({ where: { idUser: user.id }, attributes: ['idProduct'], raw: true });

        const pref = await UserPreference.findOne({ where: { userId: user.id }, raw: true }) as UserPreferenceAttributes | null;

        const favoriteIds = userFavorites.map((f: any) => f.idProduct).filter(Boolean);

        // 💡 1. REFRESH DINÁMICO: Eliminamos las recomendaciones viejas de este usuario.
        // Esto asegura que si hoy le gusta Apple y mañana Samsung, las tarjetas viejas desaparezcan.
        await Recommendation.destroy({
            where: { idUser: user.id }
        });

        let whereClause: any = {
            isActive: true,
            id: { [Op.notIn]: favoriteIds.length > 0 ? favoriteIds : [] } // No recomendamos lo que ya es favorito
        };

        let hasPreferenceFilters = false;
        let score = 90;
        let explanationText = 'Recomendado especialmente para vos según tus preferencias.';

        const includeOptions: any[] = [];

        // 💡 2. FILTROS POR NOMBRE (Usando las relaciones con Category y Brand)
        if (pref) {
            // Filtro por Presupuesto (Este sí va directo en la tabla Product)
            if (pref.minPrice != null || pref.maxPrice != null) {
                whereClause.price = {};
                if (pref.minPrice != null) {
                    whereClause.price[Op.gte] = pref.minPrice;
                    hasPreferenceFilters = true;
                }
                if (pref.maxPrice != null) {
                    whereClause.price[Op.lte] = pref.maxPrice;
                    hasPreferenceFilters = true;
                }
            }

            // Filtro por Categorías (Buscamos por el nombre en la tabla unida)
            if (pref.selectedCategories) {
                const categoryNames = pref.selectedCategories.split(',').filter(Boolean);
                if (categoryNames.length > 0) {
                    includeOptions.push({
                        model: Category,
                        as: 'category',
                        where: { name: { [Op.in]: categoryNames } },
                        required: true // INNER JOIN
                    });
                    hasPreferenceFilters = true;
                }
            }

            // Filtro por Marcas (Buscamos por el nombre en la tabla unida)
            if (pref.preferredBrands || pref.excludedBrands) {
                const prefBrands = pref.preferredBrands ? pref.preferredBrands.split(',').filter(Boolean) : [];
                const exclBrands = pref.excludedBrands ? pref.excludedBrands.split(',').filter(Boolean) : [];
                
                let brandWhere: any = {};
                
                if (prefBrands.length > 0 && exclBrands.length > 0) {
                    brandWhere = {
                        [Op.and]: [
                            { name: { [Op.in]: prefBrands } },
                            { name: { [Op.notIn]: exclBrands } }
                        ]
                    };
                    hasPreferenceFilters = true;
                } else if (prefBrands.length > 0) {
                    brandWhere.name = { [Op.in]: prefBrands };
                    hasPreferenceFilters = true;
                } else if (exclBrands.length > 0) {
                    brandWhere.name = { [Op.notIn]: exclBrands };
                    hasPreferenceFilters = true;
                }

                if (Object.keys(brandWhere).length > 0) {
                    includeOptions.push({
                        model: Brand,
                        as: 'brand',
                        where: brandWhere,
                        required: true // INNER JOIN
                    });
                }
            }
        }

        // 3. FALLBACK: Si no configuró preferencias, usamos las categorías de sus favoritos
        if (!hasPreferenceFilters && favoriteIds.length > 0) {
            const favoriteProducts = await Product.findAll({
                where: { id: { [Op.in]: favoriteIds } },
                attributes: ['categoryId'],
                raw: true
            });
            
            const fallbackCategoryIds = [...new Set(favoriteProducts.map((p: any) => p.categoryId))].filter(Boolean);
            
            if (fallbackCategoryIds.length > 0) {
                whereClause.categoryId = { [Op.in]: fallbackCategoryIds };
                score = 70;
                explanationText = 'Recomendado porque agregaste productos similares a favoritos.';
            } else {
                continue;
            }
        } else if (!hasPreferenceFilters && favoriteIds.length === 0) {
            // Si no tiene preferencias ni favoritos, pasamos al siguiente usuario
            continue; 
        }

        // 4. BUSCAMOS LOS PRODUCTOS
        const suggestions = await Product.findAll({
            where: whereClause,
            include: includeOptions, // <--- ¡AQUÍ ESTÁ LA SOLUCIÓN! Le pasamos el array directamente
            limit: 15,
            order: [['createdAt', 'DESC']]
        });

        if (suggestions.length === 0) continue;

        // 5. GUARDAMOS LAS NUEVAS RECOMENDACIONES
        for (const prodInstance of suggestions) {
            const prod: any = prodInstance.toJSON(); // Parseamos la instancia a JSON limpio
            const currentProductId = prod.id;

            if (!currentProductId) continue;

            try {
                // Como ya destruimos todo al principio, podemos hacer create directo y ahorrar tiempo
                await Recommendation.create({
                    idUser: user.id,
                    idProduct: currentProductId,
                    score: score,
                    explanationText: explanationText,
                    expirationAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expiran en 7 días
                    isActive: true
                });
            } catch (error: any) {
                console.error(`🚨 Error al crear recomendación para User ${user.id} - Prod ${currentProductId}:`, error.message);
            }
        }
    }
}

  async getRecommendationsByUser(userId: number) {
    return await Recommendation.findAll({
      where: { 
        idUser: userId, 
        isActive: true,
        expirationAt: { [Op.gt]: new Date() }
      },
      include: [{ 
        model: Product, 
        as: 'product',
        attributes: ['id', 'name', 'price', 'categoryId' ] // Agregá los campos que necesites
      }],
      order: [['createdAt', 'DESC']]
    });
  }
}

export const recommendationService = new RecommendationService();