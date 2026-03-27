import { Request, Response, NextFunction } from "express";
import * as favoriteService from "../../core/services/favorite.service.js";
import { UnauthorizedError, NotFoundError } from "../../utils/errors.js";

export const add = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const idUser = (req as any).user?.userId;

    if (!idUser) {
      throw new UnauthorizedError("Usuario no autenticado", { action: "addFavorite" });
    }

    const { idProduct} = req.body;

    const favorite = await favoriteService.addFavorite(idUser, idProduct);
    res.status(201).json({ success: true, message: "Producto agregado a favoritos", data: favorite });
  } catch (error) {
    next(error);
  }
};

export const getMyFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const idUser = (req as any).user?.userId;

    if (!idUser) {
      throw new UnauthorizedError("Usuario no autenticado", { action: "getMyFavorites" });
    }

    const favorites = await favoriteService.getUserFavorites(idUser);
    res.status(200).json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const idUser = (req as any).user?.userId;
    const idProduct = Number(req.params.idProduct);

    if (!idUser) {
      throw new UnauthorizedError("Usuario no autenticado", { action: "removeFavorite" });
    }

    const isDeleted = await favoriteService.removeFavorite(idUser, idProduct);
    
    if (!isDeleted) {
      throw new NotFoundError("El producto no está en tus favoritos", { 
        resource: "favorite", 
        resourceId: idProduct 
      });
    }

    res.status(200).json({ success: true, message: "Producto eliminado de favoritos" });
  } catch (error) {
    next(error);
  }
};