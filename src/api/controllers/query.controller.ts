import type { Request, Response, NextFunction } from "express";
import { queryService } from "../../core/services/query.service.js";
import jwt from 'jsonwebtoken';

class QueryController {
  async logSearch(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { search, idProduct } = req.body;
      let idUser: number | null = null;

      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ');
        
        // El secret DEBE ser un string. Usamos un fallback o casting.
        const secret = process.env.JWT_SECRET || 'secret_de_respaldo';

        try {
          // Casteamos a 'any' para poder leer las propiedades del payload sin errores de overload
          const decoded = jwt.verify(token[1] as string, secret) as any;
          idUser = decoded?.userId || decoded?.id || null;
        } catch (err) {
          console.log("Token inválido, se registra como invitado.");
        }
      }

      if (!search) {
        res.status(400).json({ success: false, message: "El campo search es requerido" });
        return;
      }

      // Aseguramos que search sea string para el servicio
      await queryService.logSearchQuery({ 
        idUser, 
        search: String(search), 
        idProduct: idProduct ? Number(idProduct) : null 
      });

      res.status(201).json({ 
        success: true, 
        message: idUser ? "Búsqueda de usuario registrada" : "Búsqueda de invitado registrada" 
      });

    } catch (error) {
      next(error);
    }
  }
}

export const queryController = new QueryController();