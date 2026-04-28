import express from "express";
import './core/models/index.js';
import type { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config/config.js";
import cron from 'node-cron';
import {
  errorHandler,
  notFoundHandler,
} from "./api/middlewares/errorHandler.middleware.js";
import authRoutes from "./api/routes/auth.router.js";
import userRoutes from "./api/routes/user.router.js";
import productRoutes from "./api/routes/product.router.js";
import brandRoutes from "./api/routes/brand.routes.js";
import categoryRoutes from "./api/routes/category.routes.js";
import favoriteRouter from "./api/routes/favorite.router.js";
import analyticsRouter from './api/routes/analytics.router.js';
import listingRoutes from "./api/routes/listing.routes.js";
import featureRoutes from "./api/routes/feature.routes.js";
import adminRoutes from "./api/routes/admin.router.js";
import chatbotRoutes from "./api/routes/chatbot.routes.js"
import storeRoutes from "./api/routes/store.routes.js"
import notificationRoutes from "./api/routes/notifiaction.routes.js";
import internalRoutes from "./api/routes/internal.routes.js";
import recommendationRoutes from "./api/routes/recomendation.routes.js";
import { recommendationService } from './core/services/recomendation.service.js';
import logSearch from "./api/routes/query.routes.js";
// import productRoutes from "./api/routes/product.router.js";
const app: Application = express();

// ==================== MIDDLEWARES ====================

// CORS
app.use(
  cors({
    origin: config.server.corsOrigin,
    credentials: true,
  }),
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cron para eventos que tienen que ocurrir periódicamente (ej: limpieza de datos, generación de reportes, etc)
cron.schedule('0 3 * * *', () => {
  console.log('🤖 Ejecutando motor de recomendaciones...');
  recommendationService.generateAutomatedRecommendations();
});

// ==================== RUTAS ====================

//check server status
app.get("/check", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "HardMatch Gateway",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites', favoriteRouter);
app.use('/api/redirect', analyticsRouter);
app.use("/api/listings", listingRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/stores', storeRoutes)
app.use("/api/admin", adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/internal', internalRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/queries', logSearch);
// ==================== MANEJO DE ERRORES ====================
// Error handler global estandarizado
app.use(errorHandler);
// 404 - Ruta no encontrada
app.use(notFoundHandler);

export default app;
