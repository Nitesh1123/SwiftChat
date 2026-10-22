import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { loginSchema, registerSchema } from "./auth.validation";
import { getMyProfile, getSocketToken, loginController, logoutController, refreshAccessTokenController, registerController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
// No authMiddleware: this is called precisely when the access token has expired.
// The controller verifies the refresh token itself.
router.post("/refresh-token", refreshAccessTokenController);
router.post("/logout", authMiddleware, logoutController);
router.get("/me", authMiddleware, getMyProfile);
router.get("/socket-token", authMiddleware, getSocketToken);

export default router;
