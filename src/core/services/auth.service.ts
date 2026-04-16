import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";
import config from "../../config/config.js";
import { SALT_ROUNDS, ROLE_CLIENT } from "../../config/constants.js";
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
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
} from "../interfaces/auth.interfaces.js";
import { validateInputs } from "../tools/validateInputs.js";

class AuthService {

  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Validar datos de entrada
    const validatedData = validateInputs(
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

    const phoneExists = await User.findOne({
      where: { phone: validatedData.phone },
    });
    if (phoneExists) {
      throw new ConflictError("El teléfono ya está en uso", {
        resource: "user",
        action: "register",
        details: { field: "phone", value: validatedData.phone },
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
      role: validatedData.role || ROLE_CLIENT,
      phone: validatedData.phone,
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

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Validar datos de entrada
    const validatedData = validateInputs(dtoSchemas.auth.login, data, "login");

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

  async changePassword(userId: number, data: ChangePasswordDTO): Promise<void> {
    // Validar datos de entrada
    const validatedData = validateInputs(
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
