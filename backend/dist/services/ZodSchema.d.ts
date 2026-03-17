import { z } from "zod";
export declare const interviewReportSchemaZodd: z.ZodObject<{
    matchScore: z.ZodNumber;
    technicalQuestion: z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        intention: z.ZodString;
        answer: z.ZodString;
    }, z.core.$strip>>;
    behaviouralQuestion: z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        intention: z.ZodString;
        answer: z.ZodString;
    }, z.core.$strip>>;
    skillGap: z.ZodArray<z.ZodObject<{
        skill: z.ZodString;
        severity: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>;
    }, z.core.$strip>>;
    preparationPlan: z.ZodArray<z.ZodObject<{
        day: z.ZodNumber;
        focus: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>;
        tasks: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type IInterviewReport = z.infer<typeof interviewReportSchemaZodd>;
//# sourceMappingURL=ZodSchema.d.ts.map