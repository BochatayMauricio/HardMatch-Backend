// src/routes/internal.router.ts
import { Router, Request, Response, NextFunction } from "express";
import { internalController } from "../controllers/internal.controller.js";

const router = Router();

// Middleware de seguridad básico: Solo deja pasar si envían la clave correcta
const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;
  
  if (apiKey === expectedKey) {
    return next();
  }
  
  res.status(403).json({ success: false, message: "Acceso denegado. API Key inválida." });
};

// Definimos el endpoint y le ponemos el candado (requireApiKey)
router.post(
  "/process-match", 
  requireApiKey, 
  internalController.processNewProduct.bind(internalController)
);

export default router;