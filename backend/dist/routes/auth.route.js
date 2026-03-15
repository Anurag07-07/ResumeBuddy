import { Router } from "express";
import { Signin, Signup } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.js";
const router = Router();
router.post('/signup', Signup);
router.post('/signin', Signin);
export default router;
//# sourceMappingURL=auth.route.js.map