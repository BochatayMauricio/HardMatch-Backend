import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { userController } from "../controllers/user.controller.js";

const router = Router();


router.put(
  "/modify-profile",
  authenticate,
  userController.modifyProfile.bind(userController),
);

router.get(
  "/get-by-id/:id",
  authenticate,
  userController.getUserById.bind(userController),
);

router.put(
  "/change-password",
  authenticate,
  userController.changePassword.bind(userController)
);

router.get(
  "/preferences",
  authenticate,
  userController.getPreferences.bind(userController)
);

router.put(
  "/preferences",
  authenticate,
  userController.updatePreferences.bind(userController)
);

export default router;
