-- =========================================================
-- SCRIPT DE POBLAMIENTO INICIAL PARA HARDMATCH
-- IMPORTANTE: Ejecutar en orden para respetar Claves Foráneas
-- =========================================================

-- 1. Limpiar las tablas (Opcional, descomentar si querés resetear la BD antes de insertar)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE product_features;
-- TRUNCATE TABLE prices;
-- TRUNCATE TABLE listings;
-- TRUNCATE TABLE features;
-- TRUNCATE TABLE products;
-- TRUNCATE TABLE categories;
-- TRUNCATE TABLE brands;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- NIVEL 1: CATEGORÍAS Y MARCAS (No dependen de nadie)
-- =========================================================

INSERT INTO categories (id, name, isActive, createdAt, updatedAt) VALUES
(1, 'Placas de Video', 1, NOW(), NOW()),
(2, 'Procesadores', 1, NOW(), NOW()),
(3, 'Notebooks', 1, NOW(), NOW()),
(4, 'Monitores', 1, NOW(), NOW());

INSERT INTO brands (id, name, description, isActive, createdAt, updatedAt) VALUES
(1, 'Nvidia', 'Fabricante líder mundial en GPUs e Inteligencia Artificial', 1, NOW(), NOW()),
(2, 'AMD', 'Fabricante de procesadores Ryzen y gráficas Radeon', 1, NOW(), NOW()),
(3, 'Intel', 'Gigante tecnológico creador de la familia Core', 1, NOW(), NOW()),
(4, 'Asus', 'Fabricante de motherboards, placas de video y notebooks ROG', 1, NOW(), NOW()),
(5, 'Samsung', 'Líder en paneles de monitores y almacenamiento', 1, NOW(), NOW());

-- =========================================================
-- NIVEL 2: DICCIONARIO DE CARACTERÍSTICAS
-- =========================================================

INSERT INTO features (id, keyword, value, isActive) VALUES
(1, 'VRAM', '24GB GDDR6X', 1),
(2, 'VRAM', '16GB GDDR6', 1),
(3, 'Núcleos', '16 Cores / 32 Threads', 1),
(4, 'Frecuencia Base', '4.5 GHz', 1),
(5, 'Memoria RAM', '16GB DDR5 4800MHz', 1),
(6, 'Almacenamiento', '1TB NVMe PCIe Gen4', 1),
(7, 'Pantalla', '15.6" Full HD 144Hz', 1);

-- =========================================================
-- NIVEL 3: PRODUCTOS MAESTROS (Dependen de Marcas y Categorías)
-- =========================================================

INSERT INTO products (id, name, urlAccess, price, brandId, categoryId, isActive, createdAt, updatedAt) VALUES
(1, 'NVIDIA GeForce RTX 4090 Founders Edition', 'https://hardmatch.com/rtx4090', 1850000.00, 1, 1, 1, NOW(), NOW()),
(2, 'AMD Radeon RX 7900 XTX', 'https://hardmatch.com/rx7900', 1450000.00, 2, 1, 1, NOW(), NOW()),
(3, 'Procesador AMD Ryzen 9 7950X', 'https://hardmatch.com/ryzen9', 750000.00, 2, 2, 1, NOW(), NOW()),
(4, 'Notebook Asus ROG Strix G15', 'https://hardmatch.com/asusrog', 2100000.00, 4, 3, 1, NOW(), NOW());

-- =========================================================
-- NIVEL 4: ASOCIACIONES (Pivot) Y OFERTAS (Listings/Prices)
-- =========================================================

-- Asociar características a los productos (Tabla: product_features)
INSERT INTO product_features (idProduct, idFeature) VALUES
(1, 1), -- RTX 4090 -> 24GB VRAM
(2, 2), -- RX 7900 -> 16GB VRAM
(3, 3), -- Ryzen 9 -> 16 Cores
(3, 4), -- Ryzen 9 -> 4.5 GHz
(4, 5), -- Notebook Asus -> 16GB RAM
(4, 6), -- Notebook Asus -> 1TB NVMe
(4, 7); -- Notebook Asus -> Pantalla 144Hz

-- Crear las Ofertas Activas del Scraper (Tabla: listings)
INSERT INTO listings (id, percent_off, productId, price_total, urlAccess, isActive, createdAt, updatedAt) VALUES
(1, 10.00, 1, 1750000.00, 'https://compragamer.com/oferta-rtx4090', 1, NOW(), NOW()),
(2, 0.00, 1, 1850000.00, 'https://mexx.com.ar/placa-video-4090', 1, NOW(), NOW()),
(3, 15.00, 3, 637500.00, 'https://mercadolibre.com.ar/ryzen9-oferta', 1, NOW(), NOW()),
(4, 5.00, 4, 1995000.00, 'https://venex.com.ar/notebook-asus', 1, NOW(), NOW());

-- Crear el Historial Evolutivo de Precios (Tabla: prices)
-- Simulamos precios más caros en el pasado, y el precio actual hoy
INSERT INTO prices (id, price, idProduct, createdAt) VALUES
(1, 1900000.00, 1, DATE_SUB(NOW(), INTERVAL 15 DAY)), -- Hace 15 días
(2, 1850000.00, 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),  -- Hace 7 días
(3, 1750000.00, 1, NOW()),                            -- Hoy
(4, 800000.00, 3, DATE_SUB(NOW(), INTERVAL 10 DAY)),  -- Ryzen hace 10 días
(5, 637500.00, 3, NOW()),                             -- Ryzen Hoy
(6, 2100000.00, 4, DATE_SUB(NOW(), INTERVAL 5 DAY)),  -- Notebook hace 5 días
(7, 1995000.00, 4, NOW());                            -- Notebook Hoy

-- FIN DEL SCRIPT