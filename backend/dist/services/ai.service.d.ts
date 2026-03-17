export declare function generateWithRetry(input: {
    resume: string;
    selfDescription: string;
    jobDescription: string;
}, retries?: number): Promise<{
    matchScore: number;
    technicalQuestion: {
        question: string;
        intention: string;
        answer: string;
    }[];
    behaviouralQuestion: {
        question: string;
        intention: string;
        answer: string;
    }[];
    skillGap: {
        skill: string;
        severity: "low" | "medium" | "high";
    }[];
    preparationPlan: {
        day: number;
        focus: "low" | "medium" | "high";
        tasks: string;
    }[];
}>;
//# sourceMappingURL=ai.service.d.ts.map