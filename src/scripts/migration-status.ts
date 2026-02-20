// src/scripts/migration-status.ts
// Script para ver el estado de las migraciones
import fs from "fs";
import path from "path";
import { sequelize } from "../config/database.js";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

const checkStatus = async () => {
  try {
    console.log("\n📊 Migration Status\n");
    console.log("=".repeat(60));

    // Verificar conexión
    await sequelize.authenticate();

    // Verificar si existe la tabla de migraciones
    const [tables] = await sequelize.query("SHOW TABLES LIKE '_migrations'");

    let executedMigrations: string[] = [];

    if ((tables as any[]).length > 0) {
      const [results] = await sequelize.query(
        "SELECT name, executed_at FROM _migrations ORDER BY name ASC",
      );
      executedMigrations = (results as { name: string }[]).map((r) => r.name);
    }

    // Obtener archivos de migración
    const allMigrations = fs.existsSync(MIGRATIONS_DIR)
      ? fs
          .readdirSync(MIGRATIONS_DIR)
          .filter((f) => f.endsWith(".sql"))
          .sort()
      : [];

    if (allMigrations.length === 0) {
      console.log("\n  No migration files found.\n");
      process.exit(0);
    }

    // Mostrar estado
    console.log("\n  Status      Migration File");
    console.log("  " + "-".repeat(56));

    let pendingCount = 0;
    for (const migration of allMigrations) {
      const isExecuted = executedMigrations.includes(migration);
      const status = isExecuted ? "✓ Executed" : "○ Pending ";
      console.log(`  ${status}  ${migration}`);
      if (!isExecuted) pendingCount++;
    }

    console.log("\n" + "=".repeat(60));
    console.log(
      `  Total: ${allMigrations.length} | Executed: ${executedMigrations.length} | Pending: ${pendingCount}`,
    );
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error checking status:", error);
    process.exit(1);
  }
};

checkStatus();
