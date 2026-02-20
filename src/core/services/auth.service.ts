import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";
import config from "../../config/config.js";
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/errors.js";
import { dtoSchemas } from "../../utils/validators.js";
import type {
  JwtPayload,
  AuthResponse,
} from "../interfaces/auth.interfaces.js";

const SALT_ROUNDS = 10;

class AuthService {
  /**
   * Valida datos con Zod y lanza ValidationError si falla
   */
  private validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    action: string,
  ): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      throw new ValidationError("Error de validación", errors, {
        resource: "auth",
        action,
        details: { fields: errors.map((e) => e.field) },
      });
    }

    return result.data;
  }

  /**
   * Registra un nuevo usuario con contraseña hasheada
   */
  async register(data: unknown): Promise<AuthResponse> {
    // Validar datos de entrada
    const validatedData = this.validate(
      dtoSchemas.auth.register,
      data,
      "register",
    );

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({
      where: { email: validatedData.email },
    });
    if (existingEmail) {
      throw new ConflictError("El email ya está registrado", {
        resource: "user",
        action: "register",
        details: { field: "email", value: validatedData.email },
      });
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({
      where: { username: validatedData.username },
    });
    if (existingUsername) {
      throw new ConflictError("El nombre de usuario ya está en uso", {
        resource: "user",
        action: "register",
        details: { field: "username", value: validatedData.username },
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      SALT_ROUNDS,
    );

    // Crear el usuario
    const user = await User.create({
      name: validatedData.name,
      surname: validatedData.surname,
      email: validatedData.email,
      username: validatedData.username,
      password: hashedPassword,
      role: validatedData.role || "CLIENT",
    });

    // Generar token JWT
    const token = this.generateToken(user);

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Inicia sesión verificando credenciales
   */
  async login(data: unknown): Promise<AuthResponse> {
    // Validar datos de entrada
    const validatedData = this.validate(dtoSchemas.auth.login, data, "login");

    // Buscar usuario por email
    const user = await User.findOne({ where: { email: validatedData.email } });
    if (!user) {
      throw new UnauthorizedError("Credenciales inválidas", {
        resource: "user",
        action: "login",
        details: { email: validatedData.email },
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedError(
        "Usuario desactivado. Contacte al administrador",
        {
          resource: "user",
          resourceId: user.id,
          action: "login",
          details: { reason: "inactive" },
        },
      );
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedError("Credenciales inválidas", {
        resource: "user",
        action: "login",
        details: { email: validatedData.email },
      });
    }

    // Generar token JWT
    const token = this.generateToken(user);

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Genera un token JWT para el usuario
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);
  }

  /**
   * Verifica y decodifica un token JWT
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch {
      throw new UnauthorizedError("Token inválido o expirado", {
        resource: "auth",
        action: "verifyToken",
      });
    }
  }

  /**
   * Obtiene un usuario por su ID (sin password)
   */
  async getUserById(id: number): Promise<AuthResponse["user"]> {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new NotFoundError("Usuario no encontrado", {
        resource: "user",
        resourceId: id,
        action: "getProfile",
      });
    }

    return user.toJSON();
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async changePassword(userId: number, data: unknown): Promise<void> {
    // Validar datos de entrada
    const validatedData = this.validate(
      dtoSchemas.auth.changePassword,
      data,
      "changePassword",
    );

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado", {
        resource: "user",
        resourceId: userId,
        action: "changePassword",
      });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(
      validatedData.currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      throw new ValidationError("Contraseña actual incorrecta", [], {
        resource: "user",
        resourceId: userId,
        action: "changePassword",
      });
    }

    // Hashear y actualizar nueva contraseña
    const hashedPassword = await bcrypt.hash(
      validatedData.newPassword,
      SALT_ROUNDS,
    );
    await user.update({ password: hashedPassword });
  }
}

export const authService = new AuthService();
