// src/scripts/create-migration.ts
// Script para crear nuevos archivos de migración
import fs from "fs";
import path from "path";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

const createMigration = () => {
  // Obtener nombre de la migración desde argumentos
  const args = process.argv.slice(2);
  let migrationName = args
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");

  if (!migrationName) {
    migrationName = "migration";
  }

  // Crear timestamp para ordenar migraciones
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 14); // YYYYMMDDHHmmss

  const fileName = `${timestamp}_${migrationName}.sql`;
  const filePath = path.join(MIGRATIONS_DIR, fileName);

  // Asegurar que existe el directorio
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }

  // Template de migración
  const template = `-- =============================================================
-- MIGRACIÓN: ${migrationName}
-- Fecha: ${now.toISOString().split("T")[0]}
-- Descripción: [Describe los cambios aquí]
-- =============================================================

-- Desactivar chequeo de foreign keys (si es necesario)
-- SET FOREIGN_KEY_CHECKS = 0;

-- ==================== TUS CAMBIOS AQUÍ ====================

-- Ejemplo: Agregar columna
-- ALTER TABLE \`tabla\` ADD COLUMN \`nueva_columna\` VARCHAR(255) NULL;

-- Ejemplo: Modificar columna
-- ALTER TABLE \`tabla\` MODIFY COLUMN \`columna\` VARCHAR(500) NOT NULL;

-- Ejemplo: Crear índice
-- CREATE INDEX \`idx_nombre\` ON \`tabla\` (\`columna\`);

-- Ejemplo: Crear tabla
-- CREATE TABLE IF NOT EXISTS \`nueva_tabla\` (
--   \`id\` INT NOT NULL AUTO_INCREMENT,
--   \`campo\` VARCHAR(100) NOT NULL,
--   PRIMARY KEY (\`id\`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== FIN DE CAMBIOS ====================

-- Reactivar chequeo de foreign keys (si lo desactivaste)
-- SET FOREIGN_KEY_CHECKS = 1;
`;

  fs.writeFileSync(filePath, template, "utf-8");

  console.log(`\n✅ Migration created successfully!\n`);
  console.log(`   📄 File: ${fileName}`);
  console.log(`   📂 Path: ${filePath}\n`);
  console.log(`   Edit the file and then run: npm run migrate\n`);
};

createMigration();
