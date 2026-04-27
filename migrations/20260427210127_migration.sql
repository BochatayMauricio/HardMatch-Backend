-- =============================================================
-- MIGRACIÓN: migration
-- Fecha: 2026-04-27
-- Descripción: [Describe los cambios aquí]
-- =============================================================

-- Desactivar chequeo de foreign keys (si es necesario)
-- SET FOREIGN_KEY_CHECKS = 0;

-- ==================== TUS CAMBIOS AQUÍ ====================

ALTER TABLE products ADD COLUMN image_url TEXT NULL;

-- ==================== FIN DE CAMBIOS ====================

-- Reactivar chequeo de foreign keys (si lo desactivaste)
-- SET FOREIGN_KEY_CHECKS = 1;
