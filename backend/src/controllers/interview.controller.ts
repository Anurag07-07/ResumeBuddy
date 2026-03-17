import type { Request, Response } from "express";
import * as pdfParse from "pdf-parse";
import interviewReportSchema from "../models/interviewReport.schema.js";
import { generateWithRetry } from "../services/ai.service.js";

export const InterView = async (req: Request, res: Response) => {
  try {
    const { selfDescription, jobDescription } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const pdfData = await new pdfParse.PDFParse(
      Uint8Array.from(req.file.buffer),
    );
    const resumeText = pdfData.getText();
    const text = (await resumeText).text;

    const interviewReportByAi = await generateWithRetry({
      resume: text,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportSchema.create({
      user: (req as any).userId,
      resume: text,
      selfDescription,
      jobDescription,
      matchScore: interviewReportByAi.matchScore,
      technicalQuestion: interviewReportByAi.technicalQuestion,
      behaviouralQuestion: interviewReportByAi.behaviouralQuestion,
      skillGap: interviewReportByAi.skillGap,
      preparationPlan: interviewReportByAi.preparationPlan,
    });
    return res.status(201).json({
      success: true,
      data: interviewReport,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
