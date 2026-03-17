import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { InterView, getReports, getReportById, generateTailoredResume, } from "../controllers/interview.controller.js";
import upload from "../middlewares/file.middleware.js";
const router = Router();
// Analyse resume against a JD
router.post("/interview", authMiddleware, upload.single("resume"), InterView);
// Fetch all reports for logged-in user
router.get("/reports", authMiddleware, getReports);
// Fetch a single report by ID
router.get("/reports/:id", authMiddleware, getReportById);
// Generate tailored resume JSON via AI (frontend renders as PDF)
router.post("/reports/:id/tailored-resume", authMiddleware, generateTailoredResume);
export default router;
//# sourceMappingURL=interview.route.js.map