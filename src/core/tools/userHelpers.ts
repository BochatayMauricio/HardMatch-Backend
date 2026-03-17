import { NotFoundError } from "../../utils/errors.js";
import { User } from "../models/User.js";

export async function getUserById(id: number): Promise<User> {
  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError("Usuario no encontrado", {
      resource: "user",
      resourceId: id,
      action: "getUserById",
    });
  }

  return user;
}
