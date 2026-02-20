import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get("/me", authenticate, authController.getProfile.bind(authController));
router.post(
  "/change-password",
  authenticate,
  authController.changePassword.bind(authController),
);

export default router;
