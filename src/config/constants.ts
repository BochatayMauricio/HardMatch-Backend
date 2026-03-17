/**
 * Constantes de la aplicación
 */

// ==================== Seguridad ====================
/** Número de rondas de hash para bcrypt */
export const SALT_ROUNDS = 10;

// ==================== Roles de Usuario ====================
/** Rol de administrador */
export const ROLE_ADMIN = "ADMIN";

/** Rol de cliente */
export const ROLE_CLIENT = "CLIENT";

/** Array de roles válidos */
export const VALID_ROLES = [ROLE_ADMIN, ROLE_CLIENT] as const;

// ==================== Estados de Usuario ====================
/** Estado activo de usuario */
export const USER_ACTIVE = true;

/** Estado inactivo de usuario */
export const USER_INACTIVE = false;
