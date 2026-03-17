import { Request, Response } from "express";
import * as favoriteService from "../../core/services/favorite.service.js";

export const add = async (req: Request, res: Response): Promise<void> => {
  try {
    // Usamos (req as any) por si TypeScript no tiene tipado el objeto 'user' del middleware
    const idUser = (req as any).user?.userId;

    if (!idUser) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const { idProduct, quantity } = req.body;

    const favorite = await favoriteService.addFavorite(idUser, idProduct, quantity);
    res.status(201).json({ success: true, message: "Producto agregado a favoritos", data: favorite });
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

export const getMyFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const idUser = (req as any).user?.userId;

    if (!idUser) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const favorites = await favoriteService.getUserFavorites(idUser);
    res.status(200).json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const idUser = (req as any).user?.userId;
    const idProduct = Number(req.params.idProduct);

    if (!idUser) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const isDeleted = await favoriteService.removeFavorite(idUser, idProduct);
    if (!isDeleted) {
      res.status(404).json({ success: false, message: "El producto no está en tus favoritos" });
      return;
    }
    res.status(200).json({ success: true, message: "Producto eliminado de favoritos" });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};