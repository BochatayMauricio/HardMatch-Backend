import type { UserAttributes } from "../models/User.js";

/**
 * DTO para registro de usuario
 */
export interface RegisterDTO {
  name: string;
  surname: string;
  email: string;
  username: string;
  password: string;
  role?: "ADMIN" | "CLIENT";
}

/**
 * DTO para inicio de sesión
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * DTO para cambio de contraseña
 */
export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

/**
 * Payload del token JWT
 */
export interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  role: "ADMIN" | "CLIENT";
}

/**
 * Respuesta de autenticación (login/register)
 */
export interface AuthResponse {
  user: Omit<UserAttributes, "password">;
  token: string;
}
