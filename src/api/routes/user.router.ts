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

export default router;
