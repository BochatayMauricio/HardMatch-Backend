import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { dtoSchemas } from "../../utils/validators.js";
import type {
  ModifyProfileDTO,
  UserDTO,
} from "../interfaces/user.interfaces.js";
import type { UserAttributes } from "../models/User.js";
import { User } from "../models/User.js";
import { validateInputs } from "../tools/validateInputs.js";

class UserService {
  async modifyProfile(
    userId: number,
    data: ModifyProfileDTO,
  ): Promise<UserDTO> {
    const validatedData = validateInputs(
      dtoSchemas.users.modifyProfile,
      data,
      "modifyProfile",
    );

    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("Usuario no encontrado", {
        resource: "user",
        resourceId: userId,
        action: "modifyProfile",
      });
    }

    const dataToUpdate = Object.fromEntries(
      Object.entries(validatedData).filter(([, value]) => value !== undefined),
    ) as Partial<UserAttributes>;

    const emailExists = await User.findOne({
      where: {
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

  /**
   * Obtiene un usuario por su ID
   */
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
}
export const userService = new UserService();
