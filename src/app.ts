import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config/config.js";
import {
  errorHandler,
  notFoundHandler,
} from "./api/middlewares/errorHandler.middleware.js";
import authRoutes from "./api/routes/auth.router.js";
import userRoutes from "./api/routes/user.router.js";
import adminRoutes from "./api/routes/admin.router.js";


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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);


// ==================== MANEJO DE ERRORES ====================
// Error handler global estandarizado
app.use(errorHandler);
// 404 - Ruta no encontrada
app.use(notFoundHandler);

export default app;
