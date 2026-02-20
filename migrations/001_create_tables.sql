-- =============================================================
-- MIGRACION HARDMATCH DATABASE
-- Fecha: 2026-02-19
-- Descripción: Crea todas las tablas del sistema HardMatch
-- =============================================================

-- Desactivar chequeo de foreign keys temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
-- TABLA: users
-- =============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `surname` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'CLIENT') DEFAULT 'CLIENT',
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: brands
-- =============================================================
CREATE TABLE IF NOT EXISTS `brands` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: categories
-- =============================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: products
-- =============================================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `urlAccess` VARCHAR(500) NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `brandId` INT NOT NULL,
  `categoryId` INT NOT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_products_brand_idx` (`brandId`),
  INDEX `fk_products_category_idx` (`categoryId`),
  CONSTRAINT `fk_products_brand`
    FOREIGN KEY (`brandId`)
    REFERENCES `brands` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`categoryId`)
    REFERENCES `categories` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: features
-- =============================================================
CREATE TABLE IF NOT EXISTS `features` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `keyword` VARCHAR(100) NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: product_features (pivot)
-- =============================================================
CREATE TABLE IF NOT EXISTS `product_features` (
  `idProduct` INT NOT NULL,
  `idFeature` INT NOT NULL,
  PRIMARY KEY (`idProduct`, `idFeature`),
  INDEX `fk_product_features_feature_idx` (`idFeature`),
  CONSTRAINT `fk_product_features_product`
    FOREIGN KEY (`idProduct`)
    REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_product_features_feature`
    FOREIGN KEY (`idFeature`)
    REFERENCES `features` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: prices (historial de precios)
-- =============================================================
CREATE TABLE IF NOT EXISTS `prices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `price` DECIMAL(10,2) NOT NULL,
  `idProduct` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_prices_product_idx` (`idProduct`),
  CONSTRAINT `fk_prices_product`
    FOREIGN KEY (`idProduct`)
    REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: listings
-- =============================================================
CREATE TABLE IF NOT EXISTS `listings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `percent_off` DECIMAL(5,2) NULL,
  `productId` INT NOT NULL,
  `price_total` DECIMAL(10,2) NOT NULL,
  `urlAccess` VARCHAR(500) NULL,
  `expirationAt` DATETIME NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_listings_product_idx` (`productId`),
  CONSTRAINT `fk_listings_product`
    FOREIGN KEY (`productId`)
    REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: favorites
-- =============================================================
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `quantity` INT NOT NULL DEFAULT 1,
  `idUser` INT NOT NULL,
  `idProduct` INT NOT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_favorites_user_idx` (`idUser`),
  INDEX `fk_favorites_product_idx` (`idProduct`),
  CONSTRAINT `fk_favorites_user`
    FOREIGN KEY (`idUser`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_favorites_product`
    FOREIGN KEY (`idProduct`)
    REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: queries
-- =============================================================
CREATE TABLE IF NOT EXISTS `queries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `idUser` INT NOT NULL,
  `idProduct` INT NULL,
  `search` VARCHAR(500) NOT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_queries_user_idx` (`idUser`),
  INDEX `fk_queries_product_idx` (`idProduct`),
  CONSTRAINT `fk_queries_user`
    FOREIGN KEY (`idUser`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_queries_product`
    FOREIGN KEY (`idProduct`)
    REFERENCES `products` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: recommendations
-- =============================================================
CREATE TABLE IF NOT EXISTS `recommendations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `score` DECIMAL(5,2) NOT NULL,
  `idProduct` INT NOT NULL,
  `idUser` INT NOT NULL,
  `explanation_text` TEXT NULL,
  `expirationAt` DATETIME NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_recommendations_user_idx` (`idUser`),
  INDEX `fk_recommendations_product_idx` (`idProduct`),
  CONSTRAINT `fk_recommendations_user`
    FOREIGN KEY (`idUser`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_recommendations_product`
    FOREIGN KEY (`idProduct`)
    REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLA: audit_logs
-- =============================================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `actor_user_id` INT NOT NULL,
  `target_table` VARCHAR(100) NOT NULL,
  `target_register_id` INT NOT NULL,
  `action` ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT') NOT NULL,
  `old_value` TEXT NULL,
  `new_value` TEXT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_audit_logs_user_idx` (`actor_user_id`),
  INDEX `idx_audit_logs_action` (`action`),
  INDEX `idx_audit_logs_target_table` (`target_table`),
  CONSTRAINT `fk_audit_logs_user`
    FOREIGN KEY (`actor_user_id`)
    REFERENCES `users` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reactivar chequeo de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- FIN DE LA MIGRACIÓN
-- =============================================================
