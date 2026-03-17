"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type FullReport } from "../lib/api";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";

type Step = "form" | "loading" | "results";

const SEV_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};
const FOCUS_LABEL: Record<string, string> = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };

export default function InterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [file, setFile] = useState<File | null>(null);
  const [self, setSelf] = useState("");
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<FullReport | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"tech" | "behav" | "gap" | "plan">("tech");
  const [dragOver, setDragOver] = useState(false);

  const toggleOpen = (key: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setToast({ message: "Please upload your resume PDF.", type: "error" });
    if (!jd.trim()) return setToast({ message: "Please paste the job description.", type: "error" });

    const fd = new FormData();
    fd.append("resume", file);
    fd.append("selfDescription", self);
    fd.append("jobDescription", jd);

    setStep("loading");
    const { data, error } = await api.analyzeResume(fd);

    if (error || !data) {
      setToast({ message: error || "Analysis failed.", type: "error" });
      setStep("form");
      return;
    }

    setReport(data.data);
    setStep("results");
  };

  const handleGeneratePDF = useCallback(async () => {
    if (!report?._id) return;
    setPdfLoading(true);
    setToast({ message: "Generating your tailored resume…", type: "success" });
    const { data, error } = await api.generateTailoredResume(report._id);
    setPdfLoading(false);
    if (error || !data) {
      setToast({ message: error || "Resume generation failed.", type: "error" });
      return;
    }
    // Store in sessionStorage and open dedicated print page
    sessionStorage.setItem("tailored_resume", JSON.stringify(data.data));
    window.open("/resume-preview", "_blank");
    setToast({ message: "Resume opened in new tab — use Ctrl+P to save as PDF!", type: "success" });
  }, [report]);

  // ── Drag & Drop ─────────────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else setToast({ message: "Only PDF files are accepted.", type: "error" });
  }, []);

  const scoreColor = (s: number) =>
    s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";

  // ════════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════════════════════════════════════════
  if (step === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "4px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin-slow 0.9s linear infinite" }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Analysing your resume…</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>Our AI is comparing your profile against the job description</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Parsing PDF", "Scoring match", "Generating questions", "Building plan"].map((t, i) => (
            <div key={t} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 100, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", animation: `fadeIn 0.4s ease ${i * 0.6}s both` }}>{t}</div>
          ))}
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RESULTS STATE
  // ════════════════════════════════════════════════════════════════════════════
  if (step === "results" && report) {
    const score = report.matchScore ?? 0;
    const tabs = [
      { id: "tech", label: `Technical (${report.technicalQuestion.length})`, icon: "💻" },
      { id: "behav", label: `Behavioural (${report.behaviouralQuestion.length})`, icon: "🧠" },
      { id: "gap", label: `Skill Gaps (${report.skillGap.length})`, icon: "⚠️" },
      { id: "plan", label: `Prep Plan (${report.preparationPlan.length} days)`, icon: "📅" },
    ] as const;

    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px 80px" }}>

          {/* Hero score card */}
          <div className="glass-card" style={{ padding: "36px 40px", marginBottom: 32, display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
            {/* Score circle */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <svg width={120} height={120} viewBox="0 0 120 120">
                <circle cx={60} cy={60} r={52} fill="none" stroke="var(--border)" strokeWidth={10} />
                <circle
                  cx={60} cy={60} r={52} fill="none"
                  stroke={scoreColor(score)} strokeWidth={10}
                  strokeDasharray={`${(score / 100) * 326.7} 326.7`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: scoreColor(score), letterSpacing: "-0.04em" }}>{score}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>/ 100</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="badge" style={{ marginBottom: 12 }}>✦ Analysis Complete</div>
              <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 8 }}>
                Match Score: {score >= 75 ? "Excellent 🎉" : score >= 50 ? "Good 👍" : "Needs Work 💪"}
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 20, maxWidth: 480 }}>
                {score >= 75
                  ? "Your profile is a strong match for this role. Review the questions below and you're ready to ace the interview."
                  : score >= 50
                  ? "Solid foundation! Address the skill gaps and practise the listed questions to improve your chances."
                  : "There are several gaps to close. Use the prep plan to boost your match score before applying."}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={handleGeneratePDF}
                  disabled={pdfLoading}
                  className="btn btn-primary"
                  style={{ padding: "10px 22px", fontSize: 13 }}
                >
                  {pdfLoading ? "⏳ Generating…" : "⬇ Download Tailored Resume"}
                </button>
                <button onClick={() => { setStep("form"); setReport(null); }} className="btn btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>
                  Analyse Another
                </button>
                <Link href="/reports" className="btn btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>
                  View All Reports
                </Link>
              </div>
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

          {/* Technical Questions */}
          {activeSection === "tech" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.technicalQuestion.map((q, i) => (
                <div key={i} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                  <button
                    onClick={() => toggleOpen(`t${i}`)}
                    style={{ width: "100%", padding: "18px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, textAlign: "left" }}
                  >
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }}>Q{i + 1}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>{q.question}</span>
                    </div>
                    <span style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0, transition: "transform 0.2s ease", transform: open.has(`t${i}`) ? "rotate(180deg)" : "rotate(0)" }}>⌄</span>
                  </button>
                  {open.has(`t${i}`) && (
                    <div style={{ padding: "0 24px 20px" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                        💡 Intention
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 16, padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)" }}>{q.intention}</p>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                        ✅ Model Answer
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Behavioural Questions */}
          {activeSection === "behav" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.behaviouralQuestion.map((q, i) => (
                <div key={i} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                  <button
                    onClick={() => toggleOpen(`b${i}`)}
                    style={{ width: "100%", padding: "18px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, textAlign: "left" }}
                  >
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }}>Q{i + 1}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>{q.question}</span>
                    </div>
                    <span style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0, transition: "transform 0.2s ease", transform: open.has(`b${i}`) ? "rotate(180deg)" : "rotate(0)" }}>⌄</span>
                  </button>
                  {open.has(`b${i}`) && (
                    <div style={{ padding: "0 24px 20px" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>🎯 Trait being tested</div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 16, padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)" }}>{q.intention}</p>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>⭐ STAR Answer</div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skill Gaps */}
          {activeSection === "gap" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {report.skillGap.map((sg, i) => (
                <div key={i} className="glass-card" style={{ padding: "20px 24px", display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SEV_COLOR[sg.severity], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{sg.skill}</div>
                    <div style={{ fontSize: 12, color: SEV_COLOR[sg.severity], fontWeight: 600, marginTop: 4 }}>{sg.severity.toUpperCase()} priority</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prep Plan */}
          {activeSection === "plan" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {report.preparationPlan.map((p) => (
                <div key={p.day} className="glass-card" style={{ padding: "20px 28px", display: "flex", gap: 24, alignItems: "flex-start" }}>
                  <div style={{ textAlign: "center", flexShrink: 0, minWidth: 48 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.04em" }}>D{p.day}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>DAY</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: SEV_COLOR[p.focus] }}>{FOCUS_LABEL[p.focus]}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{p.tasks}</p>
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

  // ════════════════════════════════════════════════════════════════════════════
  // FORM STATE
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "104px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="badge animate-fade-up" style={{ marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "pulse-dot 2s infinite" }} />
            AI Interview Coach
          </div>
          <h1 className="animate-fade-up delay-100" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text-primary)", lineHeight: 1.05, marginBottom: 16 }}>
            Crack your next <span className="shimmer-text">interview.</span>
          </h1>
          <p className="animate-fade-up delay-200" style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            Upload your resume, paste the job description, and get tailored interview questions, skill-gap analysis, a 30-day prep plan, and a downloadable tailored resume PDF.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="animate-fade-up delay-300">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("resumeFile")?.click()}
            style={{
              padding: "40px 24px", borderRadius: 16,
              border: `2px dashed ${dragOver ? "var(--accent)" : file ? "#22c55e" : "var(--border)"}`,
              background: dragOver ? "var(--bg-secondary)" : "transparent",
              textAlign: "center", cursor: "pointer",
              transition: "all 0.2s ease", marginBottom: 20,
            }}
          >
            <input
              id="resumeFile"
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
            />
            <div style={{ fontSize: 36, marginBottom: 12 }}>{file ? "✅" : "📄"}</div>
            {file ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>Drop your resume here</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>or click to browse — PDF only</div>
              </>
            )}
          </div>

          {/* Self description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
              About yourself <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="e.g. 3 years in full-stack development, passionate about distributed systems, looking to move into a senior eng role…"
              value={self}
              onChange={(e) => setSelf(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Job description */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
              Job Description <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              className="input-field"
              rows={7}
              placeholder="Paste the full job description here…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              required
              style={{ resize: "vertical" }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
            Analyse My Resume →
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
            ~30 seconds · Powered by Gemini 2.5 Flash
          </p>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
