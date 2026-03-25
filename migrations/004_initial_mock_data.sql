-- =========================================================
-- SCRIPT DE POBLAMIENTO MASIVO (HARDMATCH V3.0)
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE product_features;
TRUNCATE TABLE prices;
TRUNCATE TABLE listings;
TRUNCATE TABLE features;
TRUNCATE TABLE products;
TRUNCATE TABLE stores;
TRUNCATE TABLE categories;
TRUNCATE TABLE brands;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. CATEGORÍAS (Ampliadas)
-- =========================================================
INSERT INTO categories (id, name, isActive, createdAt, updatedAt) VALUES
(1, 'Notebooks', 1, NOW(), NOW()),
(2, 'Tablets', 1, NOW(), NOW()),
(3, 'Mouse', 1, NOW(), NOW()),
(4, 'Placas de Video', 1, NOW(), NOW()),
(5, 'Procesadores', 1, NOW(), NOW()),
(6, 'Monitores', 1, NOW(), NOW()),
(7, 'Teclados', 1, NOW(), NOW());

-- =========================================================
-- 2. MARCAS (Ampliadas)
-- =========================================================
INSERT INTO brands (id, name, description, isActive, createdAt, updatedAt) VALUES
(1, 'Apple', 'Creador de la familia Mac, iPad y iPhone', 1, NOW(), NOW()),
(2, 'Lenovo', 'Fabricante líder de computadoras personales', 1, NOW(), NOW()),
(3, 'Logitech', 'Referente en periféricos y accesorios', 1, NOW(), NOW()),
(4, 'Nvidia', 'Líder mundial en GPUs e IA', 1, NOW(), NOW()),
(5, 'AMD', 'Fabricante de procesadores Ryzen y gráficas Radeon', 1, NOW(), NOW()),
(6, 'Samsung', 'Líder en paneles, smartphones y almacenamiento', 1, NOW(), NOW()),
(7, 'Asus', 'Componentes premium y línea ROG', 1, NOW(), NOW()),
(8, 'Intel', 'Creadores de la mítica familia de procesadores Core', 1, NOW(), NOW()),
(9, 'Corsair', 'Periféricos y componentes de alto rendimiento', 1, NOW(), NOW());

-- =========================================================
-- 3. TIENDAS (Ahora sí, con Banners)
-- =========================================================
INSERT INTO stores (id, name, logo, banner, description, location, isActive, createdAt, updatedAt) VALUES
(1, 'Mercado Libre', 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo__large_plus.png', '#FFE600', 'El marketplace más grande de Latinoamérica.', 'Buenos Aires, Argentina', 1, NOW(), NOW()),
(2, 'Compra Gamer', 'https://compragamer.net/web/images/logo-compragamer.png', 'https://placehold.co/1200x300/111111/00ff00?text=Hardware+Extreme+Gaming', 'Tienda especializada en hardware de alto rendimiento.', 'CABA, Buenos Aires', 1, NOW(), NOW()),
(3, 'Mexx' , 'https://www.mexx.com.ar/svg/mexx-logo.svg', '#FF6600', 'Más de 30 años de trayectoria ofreciendo tecnología.', 'Caballito, CABA', 1, NOW(), NOW()),
(4, 'Fravega', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Fr%C3%A1vega_logo.svg/1200px-Fr%C3%A1vega_logo.svg.png', 'https://placehold.co/1200x300/0033cc/ffffff?text=Tecnologia+sin+limites', 'E-commerce líder en tecnología y electrodomésticos.', 'Córdoba, Argentina', 1, NOW(), NOW());
-- =========================================================
-- 4. CARACTERÍSTICAS TÉCNICAS (Masivas y Estandarizadas)
-- =========================================================
INSERT INTO features (id, keyword, value, isActive) VALUES
-- Lote 1: Originales
(1, 'processor', 'Apple M2 (8 núcleos)', 1),
(2, 'ram', '8GB Unificada', 1),
(3, 'storage', '256GB SSD NVMe', 1),
(4, 'processor', 'AMD Ryzen 5 5500U', 1),
(5, 'ram', '8GB DDR4 3200MHz', 1),
(6, 'dpi', '8000', 1),
(7, 'buttons', '7 personalizables', 1),
(8, 'graphics', '24GB GDDR6X', 1),
(9, 'processor', '16 Cores / 32 Threads', 1),
(10, 'screen', '13.6" Liquid Retina', 1),
(11, 'battery', 'Hasta 18 horas', 1),
(12, 'os', 'macOS', 1),
(13, 'weight', '1.24 kg', 1),
(14, 'storage', '256GB SSD M.2', 1),
(15, 'screen', '15.6" FHD (1920x1080) TN', 1),
(16, 'battery', '38Wh (Hasta 7 horas)', 1),
(17, 'os', 'Windows 11 Home', 1),
(18, 'weight', '1.65 kg', 1),
(19, 'sensor', 'Darkfield de alta precisión', 1),
(20, 'connectivity', 'Bluetooth / Receptor USB Logi Bolt', 1),
(21, 'battery', 'Batería recargable Li-Po (500 mAh)', 1),
(22, 'weight', '141 g', 1),
(23, 'processor', 'Arquitectura Ada Lovelace', 1),
(24, 'connectivity', '3x DisplayPort 1.4a, 1x HDMI 2.1a', 1),
(25, 'rgb', 'Sí, sincronizable', 1),
(26, 'connectivity', 'Socket AM5', 1),
(27, 'graphics', 'AMD Radeon Graphics (Integrada)', 1),
(28, 'power', '170W TDP', 1),

-- Lote 2: NUEVAS Características para los nuevos productos
(29, 'processor', 'Snapdragon 8 Gen 2 for Galaxy', 1), -- Tab S9
(30, 'ram', '12GB LPDDR5X', 1),
(31, 'storage', '512GB UFS 4.0', 1),
(32, 'screen', '11" Dynamic AMOLED 2X 120Hz', 1),
(33, 'battery', '8400 mAh', 1),
(34, 'os', 'Android 13 (One UI)', 1),
(35, 'processor', 'Intel Core i7-13650HX', 1), -- ROG Strix G16
(36, 'ram', '16GB DDR5 4800MHz', 1),
(37, 'storage', '1TB NVMe PCIe 4.0', 1),
(38, 'screen', '16" FHD+ 165Hz IPS', 1),
(39, 'graphics', 'NVIDIA GeForce RTX 4060 8GB', 1),
(40, 'weight', '2.5 kg', 1),
(41, 'processor', '24 Cores / 32 Threads', 1), -- i9 14900K
(42, 'connectivity', 'Socket LGA 1700', 1),
(43, 'power', '253W MTP (Máx)', 1),
(44, 'processor', '8 Cores / 16 Threads (3D V-Cache)', 1), -- Ryzen 7800X3D
(45, 'power', '120W TDP', 1),
(46, 'graphics', '12GB GDDR6X', 1), -- RTX 4070 Ti
(47, 'screen', '27" QHD (2560x1440) 240Hz 1ms', 1), -- Odyssey G7
(48, 'panel', 'Fast IPS / VESA DisplayHDR 600', 1),
(49, 'switches', 'Cherry MX Speed Silver', 1), -- Corsair K70
(50, 'layout', 'Español (Latinoamérica)', 1);

-- =========================================================
-- 5. PRODUCTOS MAESTROS (Ampliados a 12)
-- =========================================================
INSERT INTO products (id, name, urlAccess, price, brandId, categoryId, isActive, createdAt, updatedAt) VALUES
-- Originales
(1, 'Apple MacBook Air M2 13"', 'https://placehold.co/800x600/f5f5f7/000000?text=MacBook+Air+M2', 559999.00, 1, 1, 1, NOW(), NOW()),
(2, 'Lenovo IdeaPad 3 15" Ryzen 5', 'https://placehold.co/800x600/e2231a/ffffff?text=Lenovo+IdeaPad+3', 289999.00, 2, 1, 1, NOW(), NOW()),
(3, 'Logitech MX Master 3', 'https://placehold.co/800x600/000000/00b8fc?text=MX+Master+3', 47999.00, 3, 3, 1, NOW(), NOW()),
(4, 'NVIDIA GeForce RTX 4090 Founders', 'https://placehold.co/800x600/000000/76b900?text=RTX+4090', 1850000.00, 4, 4, 1, NOW(), NOW()),
(5, 'AMD Ryzen 9 7950X', 'https://placehold.co/800x600/000000/ed1c24?text=Ryzen+9+7950X', 750000.00, 5, 5, 1, NOW(), NOW()),
-- Nuevos
(6, 'Samsung Galaxy Tab S9 512GB', 'https://placehold.co/800x600/000000/ffffff?text=Galaxy+Tab+S9', 1100000.00, 6, 2, 1, NOW(), NOW()),
(7, 'Asus ROG Strix G16 (2023)', 'https://placehold.co/800x600/111111/ff0055?text=ROG+Strix+G16', 2150000.00, 7, 1, 1, NOW(), NOW()),
(8, 'Intel Core i9-14900K', 'https://placehold.co/800x600/0068b5/ffffff?text=Core+i9+14900K', 850000.00, 8, 5, 1, NOW(), NOW()),
(9, 'AMD Ryzen 7 7800X3D', 'https://placehold.co/800x600/000000/ed1c24?text=Ryzen+7+7800X3D', 680000.00, 5, 5, 1, NOW(), NOW()),
(10, 'Asus TUF Gaming RTX 4070 Ti', 'https://placehold.co/800x600/1a1a1a/ffcc00?text=TUF+RTX+4070+Ti', 1250000.00, 7, 4, 1, NOW(), NOW()),
(11, 'Samsung Odyssey G7 27"', 'https://placehold.co/800x600/000000/00a8ff?text=Odyssey+G7', 750000.00, 6, 6, 1, NOW(), NOW()),
(12, 'Corsair K70 RGB PRO', 'https://placehold.co/800x600/111111/ffff00?text=Corsair+K70+PRO', 185000.00, 9, 7, 1, NOW(), NOW());

-- =========================================================
-- 6. ASIGNACIÓN DE CARACTERÍSTICAS
-- =========================================================
INSERT INTO product_features (idProduct, idFeature) VALUES
(1, 1), (1, 2), (1, 3), (1, 10), (1, 11), (1, 12), (1, 13), -- MacBook
(2, 4), (2, 5), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18), -- IdeaPad
(3, 6), (3, 7), (3, 19), (3, 20), (3, 21), (3, 22),          -- MX Master
(4, 8), (4, 23), (4, 24), (4, 25),                           -- RTX 4090
(5, 9), (5, 26), (5, 27), (5, 28),                           -- Ryzen 9
(6, 29), (6, 30), (6, 31), (6, 32), (6, 33), (6, 34),        -- Tab S9
(7, 35), (7, 36), (7, 37), (7, 38), (7, 39), (7, 17), (7, 40), -- ROG Strix G16
(8, 41), (8, 42), (8, 43),                                   -- i9-14900K
(9, 44), (9, 26), (9, 27), (9, 45),                          -- Ryzen 7 7800X3D
(10, 46), (10, 23), (10, 24), (10, 25),                      -- RTX 4070 Ti
(11, 47), (11, 48), (11, 24), (11, 25),                      -- Odyssey G7
(12, 49), (12, 50), (12, 25), (12, 20);                      -- Corsair K70

-- =========================================================
-- 7. OFERTAS CRUZADAS (Listings)
-- =========================================================
INSERT INTO listings (id, percent_off, productId, storeId, price_total, urlAccess, isActive, createdAt, updatedAt) VALUES
-- Originales
(1, 10.00, 1, 4, 503999.00, 'https://fravega.com/macbook-oferta', 1, NOW(), NOW()),
(2, 5.00, 1, 1, 531999.00, 'https://mercadolibre.com.ar/macbook', 1, NOW(), NOW()),
(3, 15.00, 4, 2, 1572500.00, 'https://compragamer.com/oferta-rtx4090', 1, NOW(), NOW()),
(4, 0.00, 5, 3, 750000.00, 'https://mexx.com.ar/ryzen9', 1, NOW(), NOW()),
(5, 20.00, 3, 1, 38399.00, 'https://mercadolibre.com.ar/mx-master', 1, NOW(), NOW()),
(6, 0.00, 2, 1, 289999.00, 'https://mercadolibre.com.ar/lenovo', 1, NOW(), NOW()),

-- Nuevas Ofertas (Competencia real entre tiendas)
(7, 12.00, 6, 1, 968000.00, 'https://mercadolibre.com.ar/tab-s9', 1, NOW(), NOW()),
(8, 0.00, 6, 4, 1100000.00, 'https://fravega.com/samsung-tab-s9', 1, NOW(), NOW()),
(9, 18.00, 7, 2, 1763000.00, 'https://compragamer.com/asus-rog-g16', 1, NOW(), NOW()),
(10, 5.00, 7, 3, 2042500.00, 'https://mexx.com.ar/rog-strix', 1, NOW(), NOW()),
(11, 0.00, 8, 3, 850000.00, 'https://mexx.com.ar/i9-14900k', 1, NOW(), NOW()),
(12, 8.00, 8, 2, 782000.00, 'https://compragamer.com/intel-i9', 1, NOW(), NOW()),
(13, 10.00, 9, 2, 612000.00, 'https://compragamer.com/ryzen-7800x3d', 1, NOW(), NOW()),
(14, 0.00, 9, 1, 680000.00, 'https://mercadolibre.com.ar/7800x3d', 1, NOW(), NOW()),
(15, 15.00, 10, 2, 1062500.00, 'https://compragamer.com/rtx-4070ti', 1, NOW(), NOW()),
(16, 5.00, 10, 3, 1187500.00, 'https://mexx.com.ar/4070ti', 1, NOW(), NOW()),
(17, 20.00, 11, 4, 600000.00, 'https://fravega.com/odyssey-g7', 1, NOW(), NOW()),
(18, 0.00, 11, 1, 750000.00, 'https://mercadolibre.com.ar/odyssey', 1, NOW(), NOW()),
(19, 10.00, 12, 2, 166500.00, 'https://compragamer.com/corsair-k70', 1, NOW(), NOW()),
(20, 0.00, 12, 1, 185000.00, 'https://mercadolibre.com.ar/k70-pro', 1, NOW(), NOW());

-- =========================================================
-- 8. HISTORIAL DE PRECIOS
-- =========================================================
INSERT INTO prices (id, price, idProduct, createdAt) VALUES
(1, 600000.00, 1, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 559999.00, 1, NOW()),
(3, 1950000.00, 4, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(4, 1850000.00, 4, NOW()),
(5, 55000.00, 3, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(6, 47999.00, 3, NOW()),
(7, 1200000.00, 6, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(8, 1100000.00, 6, NOW()),
(9, 2300000.00, 7, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(10, 2150000.00, 7, NOW()),
(11, 950000.00, 8, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(12, 850000.00, 8, NOW()),
(13, 750000.00, 9, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(14, 680000.00, 9, NOW()),
(15, 1400000.00, 10, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(16, 1250000.00, 10, NOW()),
(17, 850000.00, 11, DATE_SUB(NOW(), INTERVAL 60 DAY)),
(18, 750000.00, 11, NOW()),
(19, 210000.00, 12, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(20, 185000.00, 12, NOW());

-- FIN DEL SCRIPT