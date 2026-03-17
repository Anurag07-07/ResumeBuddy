import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { interviewReportSchemaZodd, tailoredResumeSchema } from "../utils/ZodSchema.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string
});


function sanitizeAI(data: any) {

  if (typeof data.technicalQuestion?.[0] === "string") {
    data.technicalQuestion = data.technicalQuestion.map((q: string) => ({
      question: q,
      intention: "Auto-generated intention",
      answer: "Auto-generated answer"
    }));
  }

  if (typeof data.behaviouralQuestion?.[0] === "string") {
    data.behaviouralQuestion = data.behaviouralQuestion.map((q: string) => ({
      question: q,
      intention: "Auto-generated intention",
      answer: "Auto-generated answer"
    }));
  }

  if (typeof data.skillGap?.[0] === "string") {
    data.skillGap = data.skillGap.map((s: string) => ({
      skill: s,
      severity: "medium"
    }));
  }

  if (typeof data.preparationPlan?.[0] === "string") {
    data.preparationPlan = data.preparationPlan.map((t: string, i: number) => ({
      day: i + 1,
      focus: "medium",
      tasks: t
    }));
  }

  return data;
}


async function generateinterviewReport({
  resume,
  selfDescription,
  jobDescription
}: {
  resume: string;
  selfDescription: string;
  jobDescription: string;
}) {

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
      responseJsonSchema: zodToJsonSchema(interviewReportSchemaZodd as any),
    },
  });


  const raw = response.text;

  let parsed;

  try {
    parsed = JSON.parse(raw as string);
  } catch (err) {
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


export async function generateWithRetry(
  input: { resume: string; selfDescription: string; jobDescription: string },
  retries = 3
) {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await generateinterviewReport(input);
    } catch (err: any) {
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
function sanitizeTailoredResume(data: any) {
  // Gemini sometimes returns array items as strings instead of objects.
  // Coerce them into the expected object shape.

  if (Array.isArray(data.experience)) {
    data.experience = data.experience.map((item: any) =>
      typeof item === "string"
        ? { company: "", role: item, duration: "", bullets: [] }
        : item
    );
  }

  if (Array.isArray(data.education)) {
    data.education = data.education.map((item: any) =>
      typeof item === "string"
        ? { institution: item, degree: "", year: "" }
        : item
    );
  }

  if (Array.isArray(data.projects)) {
    data.projects = data.projects.map((item: any) =>
      typeof item === "string"
        ? { name: item, description: "", tech: "" }
        : item
    );
  }

  if (Array.isArray(data.skills)) {
    data.skills = data.skills.flatMap((s: any) =>
      typeof s === "string" ? [s] : []
    );
  }

  if (Array.isArray(data.certifications)) {
    data.certifications = data.certifications.flatMap((c: any) =>
      typeof c === "string" ? [c] : []
    );
  }

  return data;
}

async function generateTailoredResumeContent({
  resume,
  selfDescription,
  jobDescription,
}: {
  resume: string;
  selfDescription: string;
  jobDescription: string;
}) {
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

  if (!raw) throw new Error("AI returned empty response for tailored resume");

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
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

export async function generateTailoredResumeWithRetry(
  input: { resume: string; selfDescription: string; jobDescription: string },
  retries = 3
) {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await generateTailoredResumeContent(input);
    } catch (err: any) {
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
