import { Router } from "express";
import { Signin, Signup } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.js";

const router:Router = Router()

router.post('/signup',Signup)
router.post('/signin',Signin)

export default router