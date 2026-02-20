-- =============================================================
-- MIGRACIÓN: add_phone_users
-- Fecha: 2026-02-20
-- Descripción: [Describe los cambios aquí]
-- =============================================================

-- Desactivar chequeo de foreign keys (si es necesario)
-- SET FOREIGN_KEY_CHECKS = 0;

-- ==================== TUS CAMBIOS AQUÍ ====================

-- Ejemplo: Agregar columna
ALTER TABLE `Users` ADD COLUMN `phone` VARCHAR(255) NULL;

-- Ejemplo: Modificar columna
-- ALTER TABLE `tabla` MODIFY COLUMN `columna` VARCHAR(500) NOT NULL;

-- Ejemplo: Crear índice
-- CREATE INDEX `idx_nombre` ON `tabla` (`columna`);

-- Ejemplo: Crear tabla
-- CREATE TABLE IF NOT EXISTS `nueva_tabla` (
--   `id` INT NOT NULL AUTO_INCREMENT,
--   `campo` VARCHAR(100) NOT NULL,
--   PRIMARY KEY (`id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== FIN DE CAMBIOS ====================

-- Reactivar chequeo de foreign keys (si lo desactivaste)
-- SET FOREIGN_KEY_CHECKS = 1;
