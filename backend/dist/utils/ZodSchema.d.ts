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
export declare const tailoredResumeSchema: z.ZodObject<{
    name: z.ZodDefault<z.ZodString>;
    title: z.ZodDefault<z.ZodString>;
    email: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    phone: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    location: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    linkedin: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    summary: z.ZodDefault<z.ZodString>;
    skills: z.ZodDefault<z.ZodArray<z.ZodString>>;
    experience: z.ZodDefault<z.ZodArray<z.ZodObject<{
        company: z.ZodDefault<z.ZodString>;
        role: z.ZodDefault<z.ZodString>;
        duration: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        bullets: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    education: z.ZodDefault<z.ZodArray<z.ZodObject<{
        institution: z.ZodDefault<z.ZodString>;
        degree: z.ZodDefault<z.ZodString>;
        year: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>>>;
    projects: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodDefault<z.ZodString>;
        description: z.ZodDefault<z.ZodString>;
        tech: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>>>;
    certifications: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type ITailoredResume = z.infer<typeof tailoredResumeSchema>;
//# sourceMappingURL=ZodSchema.d.ts.map