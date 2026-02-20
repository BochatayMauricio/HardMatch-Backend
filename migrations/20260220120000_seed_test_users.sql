-- =============================================================
-- MIGRACION: Seed usuario de prueba
-- Fecha: 2026-02-20
-- Descripción: Inserta usuarios de prueba para testing
-- =============================================================

-- Usuario ADMIN de prueba
-- Email: admin@hardmatch.com
-- Password: admin123 (hasheado con bcrypt, 10 rounds)
INSERT INTO `users` (`name`, `surname`, `email`, `username`, `password`, `role`, `isActive`)
VALUES (
  'Admin',
  'HardMatch',
  'admin@hardmatch.com',
  'admin',
  '$2b$10$1zQjvYWmtsUkaWt6wlpup.Fds8EO7UzKDwVfSUMr0AI6Fau5X6yfq',
  'ADMIN',
  1
)
ON DUPLICATE KEY UPDATE `id` = `id`;

-- Usuario CLIENT de prueba
-- Email: cliente@hardmatch.com
-- Password: cliente123 (hasheado con bcrypt, 10 rounds)
INSERT INTO `users` (`name`, `surname`, `email`, `username`, `password`, `role`, `isActive`)
VALUES (
  'Cliente',
  'Test',
  'cliente@hardmatch.com',
  'cliente',
  '$2b$10$DjQ1Lk49.5G/Hv7WoDHhlOTVlMiE99Yz0m3oJZd9BvEIiFUd1SkvO',
  'CLIENT',
  1
)
ON DUPLICATE KEY UPDATE `id` = `id`;
