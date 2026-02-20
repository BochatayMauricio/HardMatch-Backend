import app from "./app.js";
import config from "./config/config.js";
import { sequelize } from "./core/models/index.js";

const PORT = config.server.port;

// Función principal para iniciar el servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    // En desarrollo, puedes usar sync para crear las tablas automáticamente
    // NOTA: En producción, usar migraciones SQL
    if (config.env === "development") {
      // await sequelize.sync({ alter: true }); // Descomentar solo si necesitas sincronizar
      console.log("📦 Models loaded successfully");
    }

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`📡 Gateway ready to proxy requests to microservices`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Iniciar servidor
startServer();
