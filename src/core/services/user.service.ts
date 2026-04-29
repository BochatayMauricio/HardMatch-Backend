import { ConflictError, NotFoundError, UnauthorizedError } from "../../utils/errors.js";
import { dtoSchemas } from "../../utils/validators.js";
import type {
  ModifyProfileDTO,
  UserDTO,
} from "../interfaces/user.interfaces.js";
import type { UserAttributes } from "../models/User.js";
import { User } from "../models/User.js";
import { validateInputs } from "../tools/validateInputs.js";
import bcrypt from "bcrypt";

class UserService {
  async modifyProfile(userId: number, data: ModifyProfileDTO,): Promise<UserDTO> {
    const validatedData = validateInputs(dtoSchemas.users.modifyProfile, data, "modifyProfile");
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("Usuario no encontrado", {
        resource: "user",
        resourceId: userId,
        action: "modifyProfile",
      });
    }

    const dataToUpdate = Object.fromEntries(Object.entries(validatedData).filter(([, value]) => value !== undefined),) as Partial<UserAttributes>;

    const emailExists = await User.findOne({where: {
        email: dataToUpdate.email,
        id: { $ne: userId },
      },
    });

    if (emailExists) {
      throw new ConflictError("El email ya está en uso", {
        resource: "user",
        action: "modifyProfile",
        details: { field: "email" },
      });
    }

    const phoneExists = await User.findOne({
      where: {
        phone: dataToUpdate.phone,
        id: { $ne: userId },
      },
    });

    if (phoneExists) {
      throw new ConflictError("El teléfono ya está en uso", {
        resource: "user",
        action: "modifyProfile",
        details: { field: "phone" },
      });
    }

    await user.update(dataToUpdate);

    return user.toJSON() as UserDTO;
  }


  async getUserById(id: number): Promise<UserDTO> {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new NotFoundError("Usuario no encontrado", {
        resource: "user",
        resourceId: id,
        action: "getUserById",
      });
    }

    return user.toJSON() as UserDTO;
  }

  async changePassword(userId: number, data: any): Promise<void> {
    // 1. Validamos que lleguen los datos correctos
    const validatedData = validateInputs(dtoSchemas.auth.changePassword, data,"changePassword");

    // 2. Buscamos al usuario (Asegurate de que traiga el campo password)
    // A veces se excluye por defecto en los scopes del modelo User.
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    // 3. Verificamos que la contraseña actual sea la correcta
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password // El hash guardado en la BD
    );

    if (!isPasswordValid) {
      // 401 Unauthorized o 400 Bad Request
      throw new UnauthorizedError("La contraseña actual es incorrecta"); 
    }

    // 4. Encriptamos la NUEVA contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, saltRounds);

    // 5. Guardamos en la base de datos
    await user.update({ password: hashedNewPassword });
  }

}
export const userService = new UserService();
