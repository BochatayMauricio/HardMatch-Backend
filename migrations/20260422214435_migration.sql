-- =============================================================
-- MIGRACIÓN: migration
-- Fecha: 2026-04-22
-- Descripción: [Describe los cambios aquí]
-- =============================================================

CREATE TABLE user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  
  -- Arrays aplanados
  selectedCategories VARCHAR(255) DEFAULT '',
  usageTypes VARCHAR(255) DEFAULT '',
  preferredBrands VARCHAR(255) DEFAULT '',
  excludedBrands VARCHAR(255) DEFAULT '',
  priorities VARCHAR(255) DEFAULT 'precio,calidad,rendimiento',
  
  -- Presupuesto y booleanos
  minPrice FLOAT DEFAULT 0,
  maxPrice FLOAT DEFAULT 500000,
  flexibleBudget BOOLEAN DEFAULT TRUE,
  openToNewBrands BOOLEAN DEFAULT TRUE,
  
  -- Alertas
  priceDropAlert BOOLEAN DEFAULT TRUE,
  newMatchAlert BOOLEAN DEFAULT TRUE,
  stockAlert BOOLEAN DEFAULT FALSE,
  dealAlert BOOLEAN DEFAULT TRUE,
  
  -- Frecuencia usando ENUM nativo
  alertFrequency ENUM('inmediato', 'diario', 'semanal', 'nunca') DEFAULT 'diario',
  
  -- Timestamps de Sequelize
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relación fuerte con la tabla de usuarios (asumiendo que se llama 'users')
  CONSTRAINT fk_user_preferences_user 
    FOREIGN KEY (userId) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- ==================== FIN DE CAMBIOS ====================

