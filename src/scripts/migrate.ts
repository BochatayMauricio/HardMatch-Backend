// src/scripts/migrate.ts
// Script para ejecutar migraciones SQL pendientes
import fs from "fs";
import path from "path";
import { sequelize } from "../config/database.js";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

// Crear tabla de control de migraciones si no existe
const ensureMigrationsTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY name_UNIQUE (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
};

// Obtener migraciones ya ejecutadas
const getExecutedMigrations = async (): Promise<string[]> => {
  const [results] = await sequelize.query(
    "SELECT name FROM _migrations ORDER BY name ASC",
  );
  return (results as { name: string }[]).map((r) => r.name);
};

// Registrar migración como ejecutada
const markMigrationAsExecuted = async (name: string) => {
  await sequelize.query("INSERT INTO _migrations (name) VALUES (?)", {
    replacements: [name],
  });
};

// Obtener todos los archivos de migración ordenados
const getMigrationFiles = (): string[] => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
};

// Ejecutar un archivo SQL
const executeSqlFile = async (filePath: string) => {
  const sqlContent = fs.readFileSync(filePath, "utf-8");

  // Remover comentarios de línea completa y separar por ;
  const cleanedSql = sqlContent
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleanedSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    if (statement && statement.length > 0) {
      await sequelize.query(statement);
    }
  }

  return statements.length;
};

const runMigrations = async () => {
  try {
    console.log("🔄 Starting database migrations...\n");

    // Verificar conexión
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Crear tabla de control
    await ensureMigrationsTable();

    // Obtener migraciones ejecutadas y pendientes
    const executedMigrations = await getExecutedMigrations();
    const allMigrations = getMigrationFiles();
    const pendingMigrations = allMigrations.filter(
      (m) => !executedMigrations.includes(m),
    );

    if (pendingMigrations.length === 0) {
      console.log("\n✨ No pending migrations to run.");
      process.exit(0);
    }

    console.log(
      `\n📋 Found ${pendingMigrations.length} pending migration(s):\n`,
    );

    // Ejecutar cada migración pendiente
    for (const migration of pendingMigrations) {
      const filePath = path.join(MIGRATIONS_DIR, migration);
      console.log(`  ▶ Running: ${migration}`);

      try {
        const statementsCount = await executeSqlFile(filePath);
        await markMigrationAsExecuted(migration);
        console.log(`    ✓ Completed (${statementsCount} statements)\n`);
      } catch (err: any) {
        console.error(`    ✗ Failed: ${err.message}`);
        throw err;
      }
    }

    console.log("✅ All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
};

runMigrations();
