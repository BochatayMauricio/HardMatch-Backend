import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../utils/errors.js";
import type { JwtPayload } from "../interfaces/auth.interfaces.js";
import config from "../../config/config.js";

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Token inválido o expirado", {
      resource: "auth",
      action: "verifyToken",
    });
  }
};
