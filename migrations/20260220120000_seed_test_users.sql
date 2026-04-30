-- =============================================================
-- MIGRACION: Seed usuario de prueba
-- Fecha: 2026-02-20
-- Descripción: Inserta usuarios de prueba para testing
-- =============================================================

-- Usuario ADMIN de prueba
-- Email: admin@hardmatch.com
-- Password: admin123 (hasheado con bcrypt, 10 rounds)
INSERT INTO `users` (`name`, `surname`, `email`, `username`, `password`, `role`, `isActive`, `phone`, `createdAt`, `updatedAt`)
VALUES (
  'Admin',
  'HardMatch',
  'admin@hardmatch.com',
  'admin',
  '$2b$10$1zQjvYWmtsUkaWt6wlpup.Fds8EO7UzKDwVfSUMr0AI6Fau5X6yfq',
  'ADMIN',
  1,
  '3464123456',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE `id` = `id`;

-- Usuario CLIENT de prueba
-- Email: cliente@hardmatch.com
-- Password: cliente123 (hasheado con bcrypt, 10 rounds)
INSERT INTO `users` (`name`, `surname`, `email`, `username`, `password`, `role`, `isActive`,`phone`, `createdAt`, `updatedAt`)
VALUES (
  'Cliente',
  'Test',
  'cliente@hardmatch.com',
  'cliente',
  '$2b$10$DjQ1Lk49.5G/Hv7WoDHhlOTVlMiE99Yz0m3oJZd9BvEIiFUd1SkvO',
  'CLIENT',
  1,
  '3464123457',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE `id` = `id`;
