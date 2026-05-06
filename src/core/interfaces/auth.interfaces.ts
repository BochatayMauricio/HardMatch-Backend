import type { UserAttributes } from "../models/User.js";

export interface RegisterDTO {
  name: string;
  surname: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  role?: "ADMIN" | "CLIENT";
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

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
