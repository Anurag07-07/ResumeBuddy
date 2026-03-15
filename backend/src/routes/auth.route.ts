import { Router } from "express";
import { Signin, Signup, Logout } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router: Router = Router();

// Public routes
router.post('/signup', Signup);
router.post('/signin', Signin);

// Protected routes
router.post('/logout', authMiddleware, Logout);

export default router;