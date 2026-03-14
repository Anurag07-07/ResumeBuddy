import { Router } from "express";
import { Signin, Signup } from "../controllers/auth.controller.js";

const router:Router = Router()

router.post('/signup',Signup)
router.post('/signup',Signin)

export default router