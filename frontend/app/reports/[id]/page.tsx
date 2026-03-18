"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api, type FullReport, type Question } from "../../lib/api";
import Toast from "../../components/Toast";
import Navbar from "../../components/Navbar";

const SEV_COLOR: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
const SEV_BG: Record<string, string> = { high: "rgba(239,68,68,0.1)", medium: "rgba(245,158,11,0.1)", low: "rgba(34,197,94,0.1)" };
const FOCUS_LABEL: Record<string, string> = { high: "🔴 High Priority", medium: "🟡 Medium Priority", low: "🟢 Low Priority" };

/** Try to parse a JSON string, returning null on failure */
function tryParse(s: string): any {
  try { return JSON.parse(s); } catch { return null; }
}

/**
 * Robust question extractor that handles every variant Gemini/old sanitizeAI
 * might have produced:
 *   1. Array of proper {question, intention, answer} objects  ← ideal
 *   2. Array of JSON strings → parse each one
 *   3. Array of objects whose .question field is itself a JSON string
 *      (old sanitizeAI created these by storing the raw string as .question)
 *   4. .question field contains MULTIPLE objects concatenated: "{...},{...}"
 *      → wrap in [...] and parse as an array to recover all questions
 */
function extractQuestions(raw: any[]): Question[] {
  const result: Question[] = [];

  for (const item of raw) {
    // Case 1 & 2: item itself might be a JSON string
    const obj = typeof item === "string" ? (tryParse(item) ?? item) : item;

    if (!obj || typeof obj !== "object") continue;

    const qField = obj.question;

    // Case 3 & 4: .question is a string starting with "{" → it's JSON-encoded
    if (typeof qField === "string" && qField.trimStart().startsWith("{")) {
      // Try as a JSON array of objects (multiple concatenated)
      const asArray = tryParse(`[${qField}]`);
      if (Array.isArray(asArray)) {
        for (const q of asArray) {
          if (q && typeof q === "object" && typeof q.question === "string") {
            result.push({
              question: q.question,
              intention: q.intention ?? "",
              answer: q.answer ?? "",
            });
          }
        }
        continue;
      }
      // Try as single JSON object
      const single = tryParse(qField);
      if (single && typeof single === "object" && typeof single.question === "string") {
        result.push({
          question: single.question,
          intention: single.intention ?? obj.intention ?? "",
          answer: single.answer ?? obj.answer ?? "",
        });
        continue;
      }
    }

    // Case 1: clean object — use as-is
    if (typeof qField === "string" && qField.length > 0) {
      result.push({
        question: qField,
        intention: obj.intention ?? "",
        answer: obj.answer ?? "",
      });
    }
  }

  return result;
}

function scoreColor(s: number) { return s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444"; }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Accordion Item Component ──────────────────────────────────────────────────
interface QuestionCardProps {
  q: Question;
  index: number;
  prefix: string;
  isOpen: boolean;
  onToggle: () => void;
  intentionLabel: string;
  answerLabel: string;
  accentColor: string;
}

function QuestionCard({ q, index, isOpen, onToggle, intentionLabel, answerLabel, accentColor }: QuestionCardProps) {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: `1px solid ${isOpen ? accentColor + "40" : "var(--border)"}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
        boxShadow: isOpen ? `0 0 0 1px ${accentColor}20, 0 4px 24px ${accentColor}10` : "none",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "18px 22px",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 14,
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
          {/* Number badge */}
          <div style={{
            minWidth: 32, height: 32,
            borderRadius: 8,
            background: isOpen ? accentColor : "var(--bg)",
            border: `1.5px solid ${isOpen ? accentColor : "var(--border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: isOpen ? "#fff" : "var(--text-muted)" }}>
              Q{index + 1}
            </span>
          </div>
          {/* Question text */}
          <span style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.6,
            paddingTop: 5,
          }}>
            {q.question}
          </span>
        </div>

        {/* Chevron */}
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "var(--bg)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease",
        }}>
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(to right, ${accentColor}40, transparent)` }} />

          {/* Intention */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 11, fontWeight: 700, color: accentColor,
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 10,
              padding: "4px 10px",
              background: `${accentColor}15`,
              borderRadius: 6,
              border: `1px solid ${accentColor}30`,
            }}>
              {intentionLabel}
            </div>
            <p style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              margin: 0,
              padding: "12px 16px",
              background: "var(--bg)",
              borderRadius: 10,
              border: "1px solid var(--border)",
              borderLeft: `3px solid ${accentColor}`,
            }}>
              {q.intention || "—"}
            </p>
          </div>

          {/* Answer */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 11, fontWeight: 700, color: "#22c55e",
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 10,
              padding: "4px 10px",
              background: "rgba(34,197,94,0.1)",
              borderRadius: 6,
              border: "1px solid rgba(34,197,94,0.25)",
            }}>
              {answerLabel}
            </div>
            <p style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.75,
              margin: 0,
              padding: "12px 16px",
              background: "var(--bg)",
              borderRadius: 10,
              border: "1px solid var(--border)",
              borderLeft: "3px solid #22c55e",
              whiteSpace: "pre-line",
            }}>
              {q.answer || "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<"tech" | "behav" | "gap" | "plan">("tech");

  const toggleOpen = (key: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const fetchReport = useCallback(async () => {
    if (!id) return;
    const { data, error } = await api.getReportById(id);
    if (error || !data) {
      setToast({ message: error || "Report not found.", type: "error" });
      setTimeout(() => router.push("/reports"), 2000);
      return;
    }
    setReport(data.data);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleGeneratePDF = useCallback(async () => {
    if (!report?._id) return;
    setPdfLoading(true);
    setToast({ message: "Generating tailored resume…", type: "success" });
    const { data, error } = await api.generateTailoredResume(report._id);
    setPdfLoading(false);
    if (error || !data) {
      setToast({ message: error || "Resume generation failed.", type: "error" });
      return;
    }
    sessionStorage.setItem("tailored_resume", JSON.stringify(data.data));
    router.push("/resume-preview");
  }, [report]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin-slow 0.9s linear infinite" }} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading report…</p>
      </div>
    );
  }

  if (!report) return null;

  const score = report.matchScore ?? 0;

  // Robust extraction — handles all legacy data formats
  const technicalQuestions = extractQuestions(report.technicalQuestion as any[]);
  const behaviouralQuestions = extractQuestions(report.behaviouralQuestion as any[]);

  // Skill gaps & prep plan — simpler shape, safe parse is enough
  const skillGaps = (report.skillGap as any[]).map((s) => {
    if (typeof s === "string") return tryParse(s) ?? s;
    return s;
  }).filter(Boolean);

  const prepPlan = (report.preparationPlan as any[]).map((p) => {
    if (typeof p === "string") return tryParse(p) ?? p;
    return p;
  }).filter(Boolean);



  const tabs = [
    { id: "tech", label: `Technical (${technicalQuestions.length})`, icon: "💻" },
    { id: "behav", label: `Behavioural (${behaviouralQuestions.length})`, icon: "🧠" },
    { id: "gap", label: `Skill Gaps (${skillGaps.length})`, icon: "⚠️" },
    { id: "plan", label: `Prep Plan`, icon: "📅" },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "96px 24px 80px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 13, color: "var(--text-muted)" }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
          <span>›</span>
          <Link href="/reports" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Reports</Link>
          <span>›</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Report Detail</span>
        </div>

        {/* Score header card */}
        <div className="glass-card" style={{ padding: "32px 36px", marginBottom: 28, display: "flex", gap: 36, alignItems: "center", flexWrap: "wrap" }}>
          {/* Circular score */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width={110} height={110} viewBox="0 0 110 110">
              <circle cx={55} cy={55} r={46} fill="none" stroke="var(--border)" strokeWidth={9} />
              <circle
                cx={55} cy={55} r={46} fill="none"
                stroke={scoreColor(score)} strokeWidth={9}
                strokeDasharray={`${(score / 100) * 289} 289`}
                strokeLinecap="round"
                transform="rotate(-90 55 55)"
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: scoreColor(score), letterSpacing: "-0.04em" }}>{score}</span>
              <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600 }}>/ 100</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginBottom: 6 }}>
              Analysed on {formatDate(report.createdAt)}
            </div>
            <h1 style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 8 }}>
              Resume Match Report
            </h1>
            <p style={{
              fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
              overflow: "hidden", maxWidth: 520, marginBottom: 18,
            }}>
              {report.jobDescription.slice(0, 200)}…
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleGeneratePDF}
                disabled={pdfLoading}
                className="btn btn-primary"
                style={{ padding: "9px 20px", fontSize: 13 }}
              >
                {pdfLoading ? "⏳ Generating…" : "⬇ Download Tailored Resume PDF"}
              </button>
              <Link href="/interview" className="btn btn-ghost" style={{ padding: "9px 18px", fontSize: 13 }}>
                New Analysis
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
            {[
              { label: "Technical Qs", value: technicalQuestions.length },
              { label: "Behavioural Qs", value: behaviouralQuestions.length },
              { label: "Skill Gaps", value: skillGaps.length },
              { label: "Prep Days", value: prepPlan.length },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id as typeof activeSection)}
              style={{
                padding: "9px 18px", borderRadius: 10, border: "1px solid var(--border)",
                background: activeSection === t.id ? "var(--accent)" : "var(--bg-secondary)",
                color: activeSection === t.id ? "var(--accent-text)" : "var(--text-secondary)",
                fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Technical Questions ── */}
        {activeSection === "tech" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {technicalQuestions.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)", fontSize: 14 }}>No technical questions found.</div>
            )}
            {technicalQuestions.map((q, i) => (
              <QuestionCard
                key={i}
                q={q}
                index={i}
                prefix="t"
                isOpen={open.has(`t${i}`)}
                onToggle={() => toggleOpen(`t${i}`)}
                intentionLabel="💡 What's Being Assessed"
                answerLabel="✅ Model Answer"
                accentColor="#6366f1"
              />
            ))}
          </div>
        )}

        {/* ── Behavioural Questions ── */}
        {activeSection === "behav" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {behaviouralQuestions.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)", fontSize: 14 }}>No behavioural questions found.</div>
            )}
            {behaviouralQuestions.map((q, i) => (
              <QuestionCard
                key={i}
                q={q}
                index={i}
                prefix="b"
                isOpen={open.has(`b${i}`)}
                onToggle={() => toggleOpen(`b${i}`)}
                intentionLabel="🎯 Trait Being Tested"
                answerLabel="⭐ STAR Answer"
                accentColor="#f59e0b"
              />
            ))}
          </div>
        )}

        {/* ── Skill Gaps ── */}
        {activeSection === "gap" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {skillGaps.map((sg: any, i: number) => (
              <div key={i} className="glass-card" style={{ padding: "20px 24px", display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: SEV_COLOR[sg.severity] ?? "#888", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{sg.skill}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, marginTop: 5,
                    padding: "3px 8px", borderRadius: 5,
                    display: "inline-block",
                    background: SEV_BG[sg.severity] ?? "var(--bg-secondary)",
                    color: SEV_COLOR[sg.severity] ?? "var(--text-muted)",
                    border: `1px solid ${SEV_COLOR[sg.severity] ?? "var(--border)"}40`,
                  }}>
                    {(sg.severity ?? "unknown").toUpperCase()} PRIORITY
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Prep Plan ── */}
        {activeSection === "plan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {prepPlan.map((p: any) => (
              <div key={p.day} className="glass-card" style={{ padding: "20px 28px", display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div style={{ textAlign: "center", flexShrink: 0, minWidth: 48 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.04em" }}>D{p.day}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>DAY</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: SEV_COLOR[p.focus] ?? "var(--text-muted)",
                      padding: "3px 10px", borderRadius: 6,
                      background: SEV_BG[p.focus] ?? "var(--bg-secondary)",
                      border: `1px solid ${SEV_COLOR[p.focus] ?? "var(--border)"}30`,
                    }}>
                      {FOCUS_LABEL[p.focus] ?? p.focus}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{p.tasks}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
