-- =============================================================
-- MIGRACIÓN: actualizaciones_esquema
-- Fecha: 2026-04-30
-- Descripción: [Describe los cambios aquí]
-- =============================================================

-- Desactivar chequeo de foreign keys (si es necesario)
-- SET FOREIGN_KEY_CHECKS = 0;

-- ==================== TUS CAMBIOS AQUÍ ====================

-- Modificar tabla queries
ALTER TABLE Queries 
MODIFY COLUMN idUser INT NULL,
MODIFY COLUMN idProduct INT NULL;

-- Crear tabla listing_clicks
CREATE TABLE IF NOT EXISTS listing_clicks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    user_id INT NULL, -- Sigue siendo NULL por si un visitante anónimo hace clic
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones (Asegurate de que las tablas referenciadas se llamen así)
    CONSTRAINT FK_Click_Listing FOREIGN KEY (listing_id) 
        REFERENCES listings(id) ON DELETE CASCADE,
    CONSTRAINT FK_Click_User FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== FIN DE CAMBIOS ====================

-- Reactivar chequeo de foreign keys (si lo desactivaste)
-- SET FOREIGN_KEY_CHECKS = 1;
