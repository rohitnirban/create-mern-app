import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { csrfProtection } from "../middleware/csrf";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} from "../middleware/rateLimiter";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", registerLimiter, validateBody(registerSchema), authController.register);
router.post("/login", loginLimiter, validateBody(loginSchema), authController.login);
router.post("/logout", authenticate, csrfProtection, authController.logout);
router.post("/refresh", refreshLimiter, authController.refresh);
router.get("/me", authenticate, userController.getMe);

export default router;
