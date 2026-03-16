import { Router } from "express";
import { Signin, Signup, Logout, getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = Router();
// Public routes
router.post('/signup', Signup);
router.post('/signin', Signin);
// Protected routes
router.post('/logout', authMiddleware, Logout);
router.get('/getme', authMiddleware, getMe);
export default router;
//# sourceMappingURL=auth.route.js.map