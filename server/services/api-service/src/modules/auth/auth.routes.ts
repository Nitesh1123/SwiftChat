import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { loginSchema, registerSchema } from "./auth.validation";
import { getMyProfile, loginController, logoutController, refreshAccessTokenController, registerController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/refresh-token", authMiddleware, refreshAccessTokenController);
router.post("/logout", authMiddleware, logoutController);
router.get("/me", authMiddleware, getMyProfile);

export default router;
