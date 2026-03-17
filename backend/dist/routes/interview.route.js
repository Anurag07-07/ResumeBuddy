import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { InterView } from "../controllers/interview.controller.js";
import upload from "../middlewares/file.middleware.js";
const router = Router();
router.post('/interview', authMiddleware, upload.single('resume'), InterView);
export default router;
//# sourceMappingURL=interview.route.js.map