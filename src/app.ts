// src/app.ts
import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import config from "./config/config.js";

// Importar rutas
// import scrapingRoutes from "./api/routes/scraping.routes.js";
// import authRoutes from "./api/routes/auth.router.js";
// import userRoutes from "./api/routes/user.router.js";
// import productRoutes from "./api/routes/product.router.js";
// import adminRoutes from "./api/routes/admin.router.js";
// import chatbotRoutes from "./api/routes/chatbot.router.js";

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

// ==================== RUTAS ====================

//check server status
app.get("/check", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "HardMatch Gateway",
  });
});

// API Routes
// app.use("/api/scraping", scrapingRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/chatbot", chatbotRoutes);

// ==================== MANEJO DE ERRORES ====================

// 404 - Ruta no encontrada
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handler global
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Error:", err.message);

  res.status(500).json({
    success: false,
    message:
      config.env === "development" ? err.message : "Internal server error",
  });
});

export default app;
