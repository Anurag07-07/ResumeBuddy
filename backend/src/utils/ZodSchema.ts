import { z } from "zod";

// Use the same Enum values as your Mongoose Severity
const SeverityEnum = z.enum(["low", "medium", "high"]);

export const interviewReportSchemaZodd = z.object({
  matchScore: z.number()
    .min(0)
    .max(100)
    .describe("A score representing how well the resume fits the JD"),

  technicalQuestion: z.array(
    z.object({
      question: z.string().describe("Specific technical question based on the tech stack"),
      intention: z.string().describe("What the interviewer is trying to evaluate with this question"),
      answer: z.string().describe("The ideal model answer for the candidate")
    })
  ),

  behaviouralQuestion: z.array(
    z.object({
      question: z.string().describe("Situational or personality-based question"),
      intention: z.string().describe("The soft skill or trait being tested"),
      answer: z.string().describe("A high-quality STAR method response")
    })
  ),

  skillGap: z.array(
    z.object({
      skill: z.string().describe("The specific tool or concept missing from the resume"),
      severity: SeverityEnum.describe("How critical this skill is for the role")
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number().describe("Day number of the study plan"),
      focus: SeverityEnum.describe("The intensity or importance of this day's task"),
      tasks: z.string().describe("Detailed actionable study steps")
    })
  )
});

// For TypeScript type safety elsewhere in your app
export type IInterviewReport = z.infer<typeof interviewReportSchemaZodd>;