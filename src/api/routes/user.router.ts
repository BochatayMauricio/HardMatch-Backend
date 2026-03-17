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

router.post(
  "/favorites/add",
  authenticate,
  userController.addFavorite.bind(userController),
);

router.get(
  "/favorites",
  authenticate,
  userController.getFavorites.bind(userController),
);

router.delete(
  "/favorites/:idProduct",
  authenticate,
  userController.removeFavorite.bind(userController),
);

export default router;
