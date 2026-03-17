import { Favorite } from "../models/Favorite.js";

export const addFavorite = async (idUser: number, idProduct: number, quantity: number = 1) => {
  // 1. Buscamos si el usuario ya interactuó con este producto antes
  const existingFavorite = await Favorite.findOne({
    where: { idUser, idProduct },
  });

  if (existingFavorite) {
    // Si ya existía pero lo había "borrado" (isActive: false), lo revivimos
    if (!existingFavorite.isActive) {
      await existingFavorite.update({ isActive: true, quantity });
      return existingFavorite;
    }
    // Si ya estaba activo, le actualizamos la cantidad
    await existingFavorite.update({ quantity });
    return existingFavorite;
  }

  // 2. Si nunca lo tuvo en favoritos, lo creamos de cero
  return await Favorite.create({ idUser, idProduct, quantity });
};

export const getUserFavorites = async (idUser: number) => {
  // Traemos solo los favoritos que estén activos
  return await Favorite.findAll({
    where: { idUser, isActive: true },
    // Nota: Cuando Vicente termine las asociaciones, acá sumaremos un "include" 
    // para traer los datos del Producto completo y no solo su ID.
  });
};

export const removeFavorite = async (idUser: number, idProduct: number) => {
  // Borrado lógico asegurándonos de que coincida el usuario y el producto
  const [affectedRows] = await Favorite.update(
    { isActive: false },
    { where: { idUser, idProduct, isActive: true } }
  );
  return affectedRows > 0;
};