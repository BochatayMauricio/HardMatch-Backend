import bcrypt from "bcrypt";
import { ConflictError } from "../../utils/errors.js";
import { dtoSchemas } from "../../utils/validators.js";
import { SALT_ROUNDS, ROLE_ADMIN } from "../../config/constants.js";
import type {
  CreateUserDTO,
  UpdateUserDTO,
  UserDTO,
  UserListDTO,
} from "../interfaces/user.interfaces.js";
import type { UserAttributes } from "../models/User.js";
import { User } from "../models/User.js";
import { validateInputs } from "../tools/validateInputs.js";
import { getUserById } from "../tools/userHelpers.js";

class AdminService {

  async getAllUsers(): Promise<UserListDTO[]> {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    return users.map((user) => user.toJSON() as UserListDTO);
  }

  async createUser(data: CreateUserDTO): Promise<UserDTO> {
    const validatedData = validateInputs(
      dtoSchemas.admin.createUser,
      data,
      "createUser",
    );

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({
      where: { email: validatedData.email },
    });
    if (existingEmail) {
      throw new ConflictError("El email ya está registrado", {
        resource: "user",
        action: "createUser",
        details: { field: "email" },
      });
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({
      where: { username: validatedData.username },
    });
    if (existingUsername) {
      throw new ConflictError("El nombre de usuario ya está en uso", {
        resource: "user",
        action: "createUser",
        details: { field: "username" },
      });
    }

    // Verificar si el teléfono ya existe
    const existingPhone = await User.findOne({
      where: { phone: validatedData.phone },
    });
    if (existingPhone) {
      throw new ConflictError("El teléfono ya está en uso", {
        resource: "user",
        action: "createUser",
        details: { field: "phone" },
      });
    }

    // Hashear la contraseña proporcionada
    const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

    // Crear el usuario con rol ADMIN
    const user = await User.create({
      name: validatedData.name,
      surname: validatedData.surname,
      email: validatedData.email,
      username: validatedData.username,
      password: hashedPassword,
      role: ROLE_ADMIN,
      phone: validatedData.phone,
    });

    return user.toJSON() as UserDTO;
  }

  async updateUser(
    userId: number,
    data: UpdateUserDTO,
  ): Promise<UserDTO> {
    const validatedData = validateInputs(
      dtoSchemas.admin.updateUser,
      data,
      "updateUser",
    );

    const user = await getUserById(userId);

    // Validar que no se intente actualizar el teléfono a uno que ya existe
    if (validatedData.phone) {
      const phoneExists = await User.findOne({
        where: {
          phone: validatedData.phone,
          id: { $ne: userId },
        },
      });

      if (phoneExists) {
        throw new ConflictError("El teléfono ya está en uso", {
          resource: "user",
          action: "updateUser",
          details: { field: "phone" },
        });
      }
    }

    const dataToUpdate = Object.fromEntries(
      Object.entries(validatedData).filter(([, value]) => value !== undefined),
    ) as Partial<UserAttributes>;

    await user.update(dataToUpdate);

    return user.toJSON() as UserDTO;
  }

  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    const user = await getUserById(userId);

    // Marcar como inactivo en lugar de eliminar
    await user.update({ isActive: false });

    return {
      success: true,
      message: "Usuario eliminado exitosamente",
    };
  }
}

export const adminService = new AdminService();
