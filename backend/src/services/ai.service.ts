import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { interviewReportSchemaZodd } from "../utils/ZodSchema.js";

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

  for (let i = 0; i < retries; i++) {
    try {
      return await generateinterviewReport(input);
    } catch (err) {
      console.log(`Retry ${i + 1}...`);

      await new Promise(res => setTimeout(res, 1000));
    }
  }

  throw new Error("AI failed after retries");
}