import {
  ConflictError,
  NotFoundError,
} from "../../utils/errors.js";
import { dtoSchemas } from "../../utils/validators.js";
import type { FavoriteWithProductDTO } from "../interfaces/user.interfaces.js";
import { Favorite } from "../models/Favorite.js";
import { Product } from "../models/Product.js";
import { validateInputs } from "../tools/validateInputs.js";

// Configuración de límite de favoritos (configurable)
const MAX_FAVORITES_PER_USER = 50;

class FavoritesService {
  
  async addFavorite(
    userId: number,
    productId: number,
  ): Promise<boolean> {
    const validatedData = validateInputs(
      dtoSchemas.favorites.addFavorite,
      { idProduct: productId },
      "addFavorite",
    );

    const product = await Product.findByPk(validatedData.idProduct);
    if (!product) {
      throw new NotFoundError(
        "Producto no encontrado",
        {
          resource: "product",
          resourceId: validatedData.idProduct,
          action: "addFavorite",
        },
      );
    }

    if (!product.isActive) {
      throw new ConflictError(
        "El producto no está disponible para agregar a favoritos",
        {
          resource: "product",
          resourceId: validatedData.idProduct,
          action: "addFavorite",
          details: { reason: "product_inactive" },
        },
      );
    }

    const existingFavorite = await Favorite.findOne({
      where: {
        idUser: userId,
        idProduct: validatedData.idProduct,
      },
    });

    if (existingFavorite && existingFavorite.isActive) {
      throw new ConflictError(
        "Este producto ya está en tu lista de favoritos",
        {
          resource: "favorite",
          action: "addFavorite",
          details: { field: "product_already_favorited" },
        },
      );
    }

    if (existingFavorite && !existingFavorite.isActive) {
      await existingFavorite.update({ isActive: true });
      return true;
    }

    const favoritesCount = await Favorite.count({
      where: {
        idUser: userId,
        isActive: true,
      },
    });

    if (favoritesCount >= MAX_FAVORITES_PER_USER) {
      throw new ConflictError(
        `Has alcanzado el límite de ${MAX_FAVORITES_PER_USER} favoritos`,
        {
          resource: "favorite",
          action: "addFavorite",
          details: { limit: MAX_FAVORITES_PER_USER, current: favoritesCount },
        },
      );
    }

    await Favorite.create({
      idUser: userId,
      idProduct: validatedData.idProduct,
      quantity: 1,
      isActive: true,
    });

    return true;
  }

  async removeFavorite(
    userId: number,
    productId: number,
  ): Promise<boolean> {
    const validatedData = validateInputs(
      dtoSchemas.favorites.removeFavorite,
      { idProduct: productId },
      "removeFavorite",
    );

    const favorite = await Favorite.findOne({
      where: {
        idUser: userId,
        idProduct: validatedData.idProduct,
        isActive: true,
      },
    });

    if (!favorite) {
      throw new NotFoundError(
        "Este producto no está en tu lista de favoritos",
        {
          resource: "favorite",
          action: "removeFavorite",
          details: { userId, productId: validatedData.idProduct },
        },
      );
    }

    await favorite.update({ isActive: false });

    return true;
  }

  async getFavorites(
    userId: number,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{
    favorites: FavoriteWithProductDTO[];
    total: number;
    count: number;
  }> {
    const { rows: favorites, count: total } = await Favorite.findAndCountAll({
      where: {
        idUser: userId,
        isActive: true,
      },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "urlAccess"],
          required: true, 
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const favoritesData = favorites.map((favorite) => {
      const favoriteObj = favorite.toJSON() as any;
      return {
        id: favoriteObj.id,
        idUser: favoriteObj.idUser,
        idProduct: favoriteObj.idProduct,
        quantity: favoriteObj.quantity,
        product: favoriteObj.product,
        createdAt: favoriteObj.createdAt,
        updatedAt: favoriteObj.updatedAt,
      } as FavoriteWithProductDTO;
    });

    return {
      favorites: favoritesData,
      total,
      count: favoritesData.length,
    };
  }
}

export const favoritesService = new FavoritesService();
