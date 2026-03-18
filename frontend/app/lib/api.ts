const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string  


async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const json = await res.json();

    if (!res.ok) {
      return { data: null, error: json.message || "Something went wrong" };
    }

    return { data: json, error: null };
  } catch {
    return { data: null, error: "Network error. Please check your connection." };
  }
}

export interface SignupPayload { username: string; email: string; password: string; }
export interface SigninPayload { username: string; password: string; }
export interface UserResponse { message: string; user: { _id: string; username: string; email: string; }; }
export interface MeResponse { user: { _id: string; username: string; email: string; }; }

export interface ReportSummary {
  _id: string;
  jobDescription: string;
  selfDescription: string;
  matchScore: number;
  createdAt: string;
}

export interface Question { question: string; intention: string; answer: string; }
export interface SkillGap { skill: string; severity: "low" | "medium" | "high"; }
export interface PrepDay { day: number; focus: "low" | "medium" | "high"; tasks: string; }

export interface FullReport extends ReportSummary {
  resume: string;
  technicalQuestion: Question[];
  behaviouralQuestion: Question[];
  skillGap: SkillGap[];
  preparationPlan: PrepDay[];
}

export interface TailoredExperience { company: string; role: string; duration: string; bullets: string[]; }
export interface TailoredEducation { institution: string; degree: string; year: string; }
export interface TailoredProject { name: string; description: string; tech: string; }

export interface TailoredResume {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  skills: string[];
  experience: TailoredExperience[];
  education: TailoredEducation[];
  projects: TailoredProject[];
  certifications: string[];
}


// ── API object ─────────────────────────────────────────────────────────────
export const api = {
  // Auth
  signup: (payload: SignupPayload) =>
    request<UserResponse>("/signup", { method: "POST", body: JSON.stringify(payload) }),

  signin: (payload: SigninPayload) =>
    request<UserResponse>("/signin", { method: "POST", body: JSON.stringify(payload) }),

  logout: () =>
    request<{ message: string }>("/logout", { method: "POST" }),

  getMe: () => request<MeResponse>("/getme"),

  // Interview analysis (multipart/form-data)
  analyzeResume: (formData: FormData) =>
    fetch(`${BASE_URL}/interview`, {
      method: "POST",
      credentials: "include",
      body: formData,
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.message || "Failed" };
      return { data: json as { success: boolean; data: FullReport }, error: null };
    }).catch(() => ({ data: null, error: "Network error" })),

  // Reports
  getReports: () => request<{ success: boolean; data: ReportSummary[] }>("/reports"),

  getReportById: (id: string) =>
    request<{ success: boolean; data: FullReport }>(`/reports/${id}`),

  // Generate tailored resume JSON (frontend renders + prints as PDF)
  generateTailoredResume: async (reportId: string) => {
    return request<{ success: boolean; data: TailoredResume }>(`/reports/${reportId}/tailored-resume`, {
      method: "POST",
    });
  },
};
