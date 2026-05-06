-- =============================================================
-- MIGRACIÓN: add_status_to_stores
-- Fecha: 2026-05-02
-- Descripción: [Describe los cambios aquí]
-- =============================================================

-- Desactivar chequeo de foreign keys (si es necesario)
-- SET FOREIGN_KEY_CHECKS = 0;

-- ==================== TUS CAMBIOS AQUÍ ====================

-- Modificar columna stores, agregar estado para sincronización de scrapers
    ALTER TABLE stores ADD status VARCHAR(50) DEFAULT 'Online';
    ALTER TABLE stores ADD lastSync DATETIME NULL;

-- ==================== FIN DE CAMBIOS ====================

-- Reactivar chequeo de foreign keys (si lo desactivaste)
-- SET FOREIGN_KEY_CHECKS = 1;
