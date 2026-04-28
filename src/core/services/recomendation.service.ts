import { Product, Favorite, Recommendation, User } from '../models/index.js';
import { Op } from 'sequelize';

export class RecommendationService {
  
  async generateAutomatedRecommendations() {
    // Agregamos raw: true
    const users = await User.findAll({ where: { isActive: true }, raw: true });

    for (const user of users) {
      // 1. Buscamos los favoritos
      const userFavorites = await Favorite.findAll({
        where: { idUser: user.id },
        attributes: ['idProduct'],
        raw: true
      });

      if (userFavorites.length === 0) continue;

      // Filtramos por las dudas si algún favorito viene roto
      const favoriteIds = userFavorites
        .map((f: any) => f.idProduct)
        .filter((id: any) => id !== undefined && id !== null);

      if (favoriteIds.length === 0) continue;

      // 2. Obtenemos los categoryId únicos
      const favoriteProducts = await Product.findAll({
        where: { id: { [Op.in]: favoriteIds } },
        attributes: ['categoryId'],
        raw: true
      });

      const preferredCategoryIds = [...new Set(favoriteProducts.map((p: any) => p.categoryId))]
        .filter(id => id !== undefined && id !== null);

      if (preferredCategoryIds.length === 0) continue;

      // 3. Buscamos productos sugeridos (con raw: true)
      const suggestions = await Product.findAll({
        where: {
          categoryId: { [Op.in]: preferredCategoryIds },
          id: { [Op.notIn]: favoriteIds }
        },
        limit: 15,
        order: [['createdAt', 'DESC']],
        raw: true
      });

      // 4. Creamos los registros en Recomendaciones
      for (const prod of suggestions as any[]) {
        const currentProductId = prod.id || prod.idProduct;

        if (currentProductId === undefined) {
          console.error("⚠️ [PELIGRO] Producto sin ID detectado en sugerencias:", prod);
          continue; 
        }

        try {
          // 4A. Buscamos a mano (mucho más seguro que findOrCreate)
          const existingRec = await Recommendation.findOne({
            where: { 
              idUser: user.id, 
              idProduct: currentProductId 
            }
          });

          // 4B. Si no existe, lo creamos
          if (!existingRec) {
            await Recommendation.create({
              idUser: user.id,                  
              idProduct: currentProductId,      
              score: 90, 
              explanationText: `Te lo recomendamos por tu interés en productos similares.`,
              expirationAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
              isActive: true
            });
          }
        } catch (error: any) {
          // Si choca, esto nos va a imprimir EXACTAMENTE qué columna tiene la restricción
          const errorMsg = error.errors ? error.errors.message : error.message;
          console.error(`🚨 Error al crear recomendación para User ${user.id} - Prod ${currentProductId}:`, errorMsg);
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