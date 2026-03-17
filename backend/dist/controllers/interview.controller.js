import * as pdfParse from "pdf-parse";
import interviewReportSchema from "../models/interviewReport.schema.js";
import { generateWithRetry, generateTailoredResumeWithRetry } from "../services/ai.service.js";
// ── POST /interview ───────────────────────────────────────────────────────────
export const InterView = async (req, res) => {
    try {
        const { selfDescription, jobDescription } = req.body;
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });
        const pdfData = await new pdfParse.PDFParse(Uint8Array.from(req.file.buffer));
        const resumeText = pdfData.getText();
        const text = (await resumeText).text;
        const interviewReportByAi = await generateWithRetry({
            resume: text,
            selfDescription,
            jobDescription,
        });
        const interviewReport = await interviewReportSchema.create({
            user: req.userId,
            resume: text,
            selfDescription,
            jobDescription,
            matchScore: interviewReportByAi.matchScore,
            technicalQuestion: interviewReportByAi.technicalQuestion,
            behaviouralQuestion: interviewReportByAi.behaviouralQuestion,
            skillGap: interviewReportByAi.skillGap,
            preparationPlan: interviewReportByAi.preparationPlan,
        });
        return res.status(201).json({ success: true, data: interviewReport });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
// ── GET /reports ──────────────────────────────────────────────────────────────
export const getReports = async (req, res) => {
    try {
        const userId = req.userId;
        const reports = await interviewReportSchema
            .find({ user: userId })
            .select("jobDescription matchScore createdAt selfDescription")
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ success: true, data: reports });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
// ── GET /reports/:id ──────────────────────────────────────────────────────────
export const getReportById = async (req, res) => {
    try {
        const userId = req.userId;
        const id = String(req.params["id"]);
        const report = await interviewReportSchema.findOne({
            _id: id,
            user: userId,
        }).lean();
        if (!report)
            return res.status(404).json({ message: "Report not found" });
        return res.status(200).json({ success: true, data: report });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
// ── POST /reports/:id/tailored-resume ─────────────────────────────────────────
// Calls Gemini to generate a tailored resume JSON — frontend renders it as PDF.
export const generateTailoredResume = async (req, res) => {
    try {
        const userId = req.userId;
        const id = String(req.params["id"]);
        const report = await interviewReportSchema.findOne({
            _id: id,
            user: userId,
        }).lean();
        if (!report)
            return res.status(404).json({ message: "Report not found" });
        if (!report.resume)
            return res.status(400).json({ message: "No resume text in this report" });
        const tailored = await generateTailoredResumeWithRetry({
            resume: report.resume,
            selfDescription: report.selfDescription ?? "",
            jobDescription: report.jobDescription,
        });
        return res.status(200).json({ success: true, data: tailored });
    }
    catch (error) {
        console.error("Tailored resume error:", error);
        return res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=interview.controller.js.map