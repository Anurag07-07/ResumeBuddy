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
export declare function generateTailoredResumeWithRetry(input: {
    resume: string;
    selfDescription: string;
    jobDescription: string;
}, retries?: number): Promise<{
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    summary: string;
    skills: string[];
    experience: {
        company: string;
        role: string;
        duration: string;
        bullets: string[];
    }[];
    education: {
        institution: string;
        degree: string;
        year: string;
    }[];
    projects: {
        name: string;
        description: string;
        tech: string;
    }[];
    certifications: string[];
}>;
//# sourceMappingURL=ai.service.d.ts.map