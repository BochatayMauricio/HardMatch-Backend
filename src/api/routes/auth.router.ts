import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post(
  "/change-password",
  authenticate,
  authController.changePassword.bind(authController),
);
router.get("/current-user", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user, token: req.token },
  });
});

export default router;
