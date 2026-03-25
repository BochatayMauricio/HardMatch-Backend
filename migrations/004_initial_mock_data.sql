-- =========================================================
-- SCRIPT DE POBLAMIENTO INICIAL (HARDMATCH V2.1)
-- URLs PÚBLICAS PARA IMÁGENES Y LOGOS
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
-- 1. CATEGORÍAS
-- =========================================================
INSERT INTO categories (id, name, isActive, createdAt, updatedAt) VALUES
(1, 'Notebooks', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(2, 'Tablets', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(3, 'Mouse', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(4, 'Placas de Video', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(5, 'Procesadores', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00');

-- =========================================================
-- 2. MARCAS
-- =========================================================
INSERT INTO brands (id, name, description, isActive, createdAt, updatedAt) VALUES
(1, 'Apple', 'Creador de la familia Mac, iPad y iPhone', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(2, 'Lenovo', 'Fabricante líder de computadoras personales', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(3, 'Logitech', 'Referente en periféricos y accesorios', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(4, 'Nvidia', 'Líder mundial en GPUs e IA', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(5, 'AMD', 'Fabricante de procesadores Ryzen y gráficas', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00');

-- =========================================================
-- 3. TIENDAS (LOGOS CON URLs PÚBLICAS)
-- =========================================================
INSERT INTO stores (id, name, logo, description, location, isActive, createdAt, updatedAt) VALUES
(1, 'Mercado Libre', 'El marketplace más grande de Latinoamérica, con envíos en el día y compra protegida.', 'Buenos Aires, Argentina' 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo__large_plus.png', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(2, 'Compra Gamer', 'Tienda especializada en hardware de alto rendimiento y armado de PCs para gaming y diseño.', 'CABA, Buenos Aires', 'https://compragamer.net/web/images/logo-compragamer.png', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(3, 'Mexx', 'Más de 30 años de trayectoria ofreciendo tecnología, insumos y componentes de PC.', 'Caballito, CABA', 'https://www.mexx.com.ar/svg/mexx-logo.svg', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(4, 'Fravega', 'E-commerce líder en tecnología, gaming y electrodomésticos.', 'Córdoba, Argentina', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Fr%C3%A1vega_logo.svg/1200px-Fr%C3%A1vega_logo.svg.png', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00');

-- =========================================================
-- 4. CARACTERÍSTICAS TÉCNICAS (Optimizadas para íconos del Front)
-- =========================================================
INSERT INTO features (id, keyword, value, isActive) VALUES
-- Características MacBook Air M2
(1, 'processor', 'Apple M2 (8 núcleos)', 1),
(2, 'ram', '8GB Unificada', 1),
(3, 'storage', '256GB SSD NVMe', 1),
(10, 'screen', '13.6" Liquid Retina', 1),
(11, 'battery', 'Hasta 18 horas', 1),
(12, 'os', 'macOS', 1),
(13, 'weight', '1.24 kg', 1),

-- Características Lenovo IdeaPad 3
(4, 'processor', 'AMD Ryzen 5 5500U', 1),
(5, 'ram', '8GB DDR4 3200MHz', 1),
(14, 'storage', '256GB SSD M.2', 1),
(15, 'screen', '15.6" FHD (1920x1080) TN', 1),
(16, 'battery', '38Wh (Hasta 7 horas)', 1),
(17, 'os', 'Windows 11 Home', 1),
(18, 'weight', '1.65 kg', 1),

-- Características Logitech MX Master 3
(6, 'dpi', '8000', 1),
(7, 'buttons', '7 personalizables', 1),
(19, 'sensor', 'Darkfield de alta precisión', 1),
(20, 'connectivity', 'Bluetooth / Receptor USB Logi Bolt', 1),
(21, 'battery', 'Batería recargable Li-Po (500 mAh)', 1),
(22, 'weight', '141 g', 1),

-- Características RTX 4090
(8, 'graphics', '24GB GDDR6X', 1),
(23, 'processor', 'Arquitectura Ada Lovelace', 1),
(24, 'connectivity', '3x DisplayPort 1.4a, 1x HDMI 2.1a', 1),
(25, 'rgb', 'Sí, sincronizable', 1),

-- Características Ryzen 9 7950X
(9, 'processor', '16 Cores / 32 Threads', 1),
(26, 'connectivity', 'Socket AM5', 1),
(27, 'graphics', 'AMD Radeon Graphics (Integrada)', 1),
(28, 'power', '170W TDP', 1);

-- =========================================================
-- 5. PRODUCTOS MAESTROS (Con URLs de imágenes estáticas)
-- =========================================================
INSERT INTO products (id, name, urlAccess, price, brandId, categoryId, isActive, createdAt, updatedAt) VALUES
(1, 'Apple MacBook Air M2 13"', 'https://http2.mlstatic.com/D_NQ_NP_745533-MLA51368688439_082022-O.webp', 559999.00, 1, 1, 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(2, 'Lenovo IdeaPad 3 15" Ryzen 5', 'https://http2.mlstatic.com/D_NQ_NP_672993-MLA88066379858_072025-O.webp', 289999.00, 2, 1, 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(3, 'Logitech MX Master 3', 'https://http2.mlstatic.com/D_NQ_NP_833633-MLA43403387825_092020-O.webp', 47999.00, 3, 3, 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(4, 'NVIDIA GeForce RTX 4090 Founders', 'https://http2.mlstatic.com/D_NQ_NP_824901-MLA52538198748_112022-O.webp', 1850000.00, 4, 4, 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(5, 'AMD Ryzen 9 7950X', 'https://http2.mlstatic.com/D_NQ_NP_755608-MLA53234914197_012023-O.webp', 750000.00, 5, 5, 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00');

-- =========================================================
-- 6. ASIGNACIÓN DE CARACTERÍSTICAS
-- =========================================================
INSERT INTO product_features (idProduct, idFeature) VALUES
-- 1: MacBook Air M2
(1, 1), (1, 2), (1, 3), (1, 10), (1, 11), (1, 12), (1, 13),

-- 2: Lenovo IdeaPad 3
(2, 4), (2, 5), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18),

-- 3: Logitech MX Master 3
(3, 6), (3, 7), (3, 19), (3, 20), (3, 21), (3, 22),

-- 4: RTX 4090
(4, 8), (4, 23), (4, 24), (4, 25),

-- 5: Ryzen 9 7950X
(5, 9), (5, 26), (5, 27), (5, 28);

-- =========================================================
-- 7. OFERTAS (Listings)
-- =========================================================
INSERT INTO listings (id, percent_off, productId, storeId, price_total, urlAccess, isActive, createdAt, updatedAt) VALUES
-- MacBook (Fravega vs MercadoLibre)
(1, 10.00, 1, 4, 503999.00, 'https://fravega.com/macbook-oferta', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(2, 5.00, 1, 1, 531999.00, 'https://mercadolibre.com.ar/macbook', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),

-- RTX 4090 (Compra Gamer)
(3, 15.00, 4, 2, 1572500.00, 'https://compragamer.com/oferta-rtx4090', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),

-- Ryzen (Mexx)
(4, 0.00, 5, 3, 750000.00, 'https://mexx.com.ar/ryzen9', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),

-- Mouse & Lenovo (Mercado Libre)
(5, 20.00, 3, 1, 38399.00, 'https://mercadolibre.com.ar/mx-master', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00'),
(6, 0.00, 2, 1, 289999.00, 'https://mercadolibre.com.ar/lenovo', 1, '2026-03-23 10:00:00', '2026-03-23 10:00:00');

-- =========================================================
-- 8. HISTORIAL DE PRECIOS
-- =========================================================
INSERT INTO prices (id, price, idProduct, createdAt) VALUES
-- Evolución de la MacBook
(1, 600000.00, 1, '2026-03-01 10:00:00'),
(2, 580000.00, 1, '2026-03-10 10:00:00'),
(3, 559999.00, 1, '2026-03-23 10:00:00'),

-- Evolución de la RTX 4090
(4, 1950000.00, 4, '2026-03-01 10:00:00'),
(5, 1850000.00, 4, '2026-03-23 10:00:00'),

-- Evolución del Mouse Logitech
(6, 55000.00, 3, '2026-03-01 10:00:00'),
(7, 47999.00, 3, '2026-03-23 10:00:00');