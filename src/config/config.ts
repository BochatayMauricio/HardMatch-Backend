import dotenv from "dotenv";
import { z } from "zod";

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Definimos un esquema de validación para asegurar que el entorno sea correcto
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),

  // Base de Datos (MySQL/Sequelize)
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_PORT: z.string().transform(Number).default("3306"),

  // Seguridad (JWT)
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 chars long"),
  JWT_EXPIRES_IN: z.string().default("1d"),

  // Redis (Cache & Colas)
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().transform(Number).default("6379"),
  REDIS_PASSWORD: z.string().optional(),

  // Microservicios Externos (Gateway)
  // URL del microservicio Python para Scraping
  PYTHON_SCRAPER_SERVICE_URL: z.string().url("Invalid Python Service URL"),
  // URL o API Key del servicio de AI (puede ser otro microservicio o API externa)
  AI_SERVICE_URL: z.string().url().optional(),
  AI_API_KEY: z.string().optional(),

  // Configuración de CORS (Seguridad)
  CORS_ORIGIN: z.string().default("*"), // En prod cambiar por la URL del frontend
});

// Parsear y validar las variables. Si falla, lanza un error y detiene el servidor.
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

const envVars = _env.data;

// Exportamos la configuración estructurada
export default {
  env: envVars.NODE_ENV,
  server: {
    port: envVars.PORT,
    corsOrigin: envVars.CORS_ORIGIN,
  },
  db: {
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    name: envVars.DB_NAME,
    port: envVars.DB_PORT,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
  services: {
    scraper: {
      url: envVars.PYTHON_SCRAPER_SERVICE_URL,
    },
    ai: {
      url: envVars.AI_SERVICE_URL,
      apiKey: envVars.AI_API_KEY,
    },
  },
} as const;
