import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { interviewReportSchemaZodd, tailoredResumeSchema } from "../utils/ZodSchema.js";
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
/** Try to JSON.parse a string; return null on failure. */
function tryParseJSON(s) {
    try {
        return JSON.parse(s);
    }
    catch {
        return null;
    }
}
/**
 * Gemini sometimes serialises nested objects / arrays as JSON strings
 * when a responseJsonSchema is supplied.  This pass walks the top-level
 * arrays we care about and coerces any string element into the expected
 * object shape.
 */
function sanitizeAI(data) {
    // ── technicalQuestion ────────────────────────────────────────────────
    if (Array.isArray(data.technicalQuestion)) {
        data.technicalQuestion = data.technicalQuestion.map((q) => {
            if (typeof q === "string") {
                const parsed = tryParseJSON(q);
                if (parsed && typeof parsed === "object" && parsed.question)
                    return parsed;
                return { question: q, intention: "Auto-generated intention", answer: "Auto-generated answer" };
            }
            return q;
        });
    }
    // ── behaviouralQuestion ──────────────────────────────────────────────
    if (Array.isArray(data.behaviouralQuestion)) {
        data.behaviouralQuestion = data.behaviouralQuestion.map((q) => {
            if (typeof q === "string") {
                const parsed = tryParseJSON(q);
                if (parsed && typeof parsed === "object" && parsed.question)
                    return parsed;
                return { question: q, intention: "Auto-generated intention", answer: "Auto-generated answer" };
            }
            return q;
        });
    }
    // ── skillGap ─────────────────────────────────────────────────────────
    if (Array.isArray(data.skillGap)) {
        data.skillGap = data.skillGap.map((s) => {
            if (typeof s === "string") {
                const parsed = tryParseJSON(s);
                if (parsed && typeof parsed === "object" && parsed.skill)
                    return parsed;
                return { skill: s, severity: "medium" };
            }
            return s;
        });
    }
    // ── preparationPlan ──────────────────────────────────────────────────
    if (Array.isArray(data.preparationPlan)) {
        data.preparationPlan = data.preparationPlan.map((p, i) => {
            if (typeof p === "string") {
                const parsed = tryParseJSON(p);
                if (parsed && typeof parsed === "object" && parsed.tasks)
                    return parsed;
                return { day: i + 1, focus: "medium", tasks: p };
            }
            return p;
        });
    }
    return data;
}
async function generateinterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
You are an Elite Technical Hiring Manager and Career Coach.

Return STRICTLY VALID JSON only.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

OUTPUT FORMAT:
{
  "matchScore": number,
  "technicalQuestion": [
    { "question": string, "intention": string, "answer": string }
  ],
  "behaviouralQuestion": [
    { "question": string, "intention": string, "answer": string }
  ],
  "skillGap": [
    { "skill": string, "severity": "low" | "medium" | "high" }
  ],
  "preparationPlan": [
    { "day": number, "focus": "low" | "medium" | "high", "tasks": string }
  ]
}
`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(interviewReportSchemaZodd),
        },
    });
    const raw = response.text;
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch (err) {
        throw new Error("AI returned invalid JSON");
    }
    const sanitized = sanitizeAI(parsed);
    const validated = interviewReportSchemaZodd.safeParse(sanitized);
    if (!validated.success) {
        console.error(validated.error.format());
        throw new Error("AI response failed schema validation");
    }
    return validated.data;
}
export async function generateWithRetry(input, retries = 3) {
    let lastErr;
    for (let i = 0; i < retries; i++) {
        try {
            return await generateinterviewReport(input);
        }
        catch (err) {
            lastErr = err;
            // 429 quota exhaustion — retrying immediately won't help, fail fast
            if (err?.status === 429) {
                console.error("Quota exhausted (429) — not retrying.");
                break;
            }
            console.log(`Retry ${i + 1}/${retries}...`);
            await new Promise(res => setTimeout(res, 1000));
        }
    }
    throw lastErr ?? new Error("AI failed after retries");
}
// ── Sanitise what Gemini sometimes returns for the tailored resume ───────────
function sanitizeTailoredResume(data) {
    // Gemini sometimes returns array items as strings instead of objects.
    // Coerce them into the expected object shape.
    if (Array.isArray(data.experience)) {
        data.experience = data.experience.map((item) => typeof item === "string"
            ? { company: "", role: item, duration: "", bullets: [] }
            : item);
    }
    if (Array.isArray(data.education)) {
        data.education = data.education.map((item) => typeof item === "string"
            ? { institution: item, degree: "", year: "" }
            : item);
    }
    if (Array.isArray(data.projects)) {
        data.projects = data.projects.map((item) => typeof item === "string"
            ? { name: item, description: "", tech: "" }
            : item);
    }
    if (Array.isArray(data.skills)) {
        data.skills = data.skills.flatMap((s) => typeof s === "string" ? [s] : []);
    }
    if (Array.isArray(data.certifications)) {
        data.certifications = data.certifications.flatMap((c) => typeof c === "string" ? [c] : []);
    }
    return data;
}
async function generateTailoredResumeContent({ resume, selfDescription, jobDescription, }) {
    const prompt = `
You are an expert resume writer and career coach.

Based on the candidate's original resume, their self-description, and the target job description,
generate a fully tailored, ATS-optimized resume.

Original Resume:
${resume}

Self Description:
${selfDescription}

Target Job Description:
${jobDescription}

Return ONLY a raw JSON object (no markdown, no code fences) with EXACTLY this structure:
{
  "name": "<full name as string>",
  "title": "<target job title as string>",
  "email": "<email as string or empty string>",
  "phone": "<phone as string or empty string>",
  "location": "<city, country as string or empty string>",
  "linkedin": "<linkedin URL as string or empty string>",
  "summary": "<2-3 sentence ATS-optimized summary as string>",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "company": "<company name>",
      "role": "<job title>",
      "duration": "<e.g. Jan 2022 - Present>",
      "bullets": ["<action verb bullet 1>", "<action verb bullet 2>"]
    }
  ],
  "education": [
    {
      "institution": "<university name>",
      "degree": "<degree and major>",
      "year": "<graduation year>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "description": "<1-2 sentence description>",
      "tech": "<comma-separated tech stack>"
    }
  ],
  "certifications": ["<cert1>", "<cert2>"]
}

CRITICAL RULES:
- experience, education, projects MUST be arrays of OBJECTS, never strings.
- bullets MUST be an array of strings.
- skills and certifications MUST be arrays of strings.
- If data is unavailable, use empty string "" or empty array [].
- Tailor summary, skills, and bullets to the target job description.
`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            // No responseJsonSchema — causes nested arrays to be returned as strings
        },
    });
    const raw = response.text;
    if (!raw)
        throw new Error("AI returned empty response for tailored resume");
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new Error(`AI returned invalid JSON for resume: ${raw.slice(0, 300)}`);
    }
    const sanitized = sanitizeTailoredResume(parsed);
    const validated = tailoredResumeSchema.safeParse(sanitized);
    if (!validated.success) {
        console.error("Validation errors:", JSON.stringify(validated.error.format(), null, 2));
        throw new Error("Tailored resume failed schema validation");
    }
    return validated.data;
}
export async function generateTailoredResumeWithRetry(input, retries = 3) {
    let lastErr;
    for (let i = 0; i < retries; i++) {
        try {
            return await generateTailoredResumeContent(input);
        }
        catch (err) {
            lastErr = err;
            // 429 quota exhaustion — no point retrying
            if (err?.status === 429) {
                console.error("Quota exhausted (429) on tailored resume — not retrying.");
                break;
            }
            console.log(`Resume retry ${i + 1}/${retries}:`, err);
            await new Promise(res => setTimeout(res, 1500));
        }
    }
    throw lastErr ?? new Error("AI resume generation failed after retries");
}
//# sourceMappingURL=ai.service.js.map