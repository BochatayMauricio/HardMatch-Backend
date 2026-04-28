-- =============================================================
-- MIGRACIÓN: add_phone_users
-- Fecha: 2026-02-20
-- Descripción: [Describe los cambios aquí]
-- =============================================================

-- Desactivar chequeo de foreign keys (si es necesario)
-- SET FOREIGN_KEY_CHECKS = 0;

-- ==================== TUS CAMBIOS AQUÍ ====================

-- Ejemplo: Agregar columna
ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(255) NULL;


-- ==================== FIN DE CAMBIOS ====================

-- Reactivar chequeo de foreign keys (si lo desactivaste)
-- SET FOREIGN_KEY_CHECKS = 1;
