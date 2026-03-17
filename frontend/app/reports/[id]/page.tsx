"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api, type FullReport } from "../../lib/api";
import Toast from "../../components/Toast";
import Navbar from "../../components/Navbar";

const SEV_COLOR: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
const FOCUS_LABEL: Record<string, string> = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };

function scoreColor(s: number) { return s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444"; }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

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
    window.open("/resume-preview", "_blank");
    setToast({ message: "Resume opened — use Ctrl+P to save as PDF!", type: "success" });
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
  const tabs = [
    { id: "tech", label: `Technical (${report.technicalQuestion.length})`, icon: "💻" },
    { id: "behav", label: `Behavioural (${report.behaviouralQuestion.length})`, icon: "🧠" },
    { id: "gap", label: `Skill Gaps (${report.skillGap.length})`, icon: "⚠️" },
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
              { label: "Technical Qs", value: report.technicalQuestion.length },
              { label: "Behavioural Qs", value: report.behaviouralQuestion.length },
              { label: "Skill Gaps", value: report.skillGap.length },
              { label: "Prep Days", value: report.preparationPlan.length },
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
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }}>Q{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>{q.question}</span>
                  </div>
                  <span style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0, transform: open.has(`t${i}`) ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>⌄</span>
                </button>
                {open.has(`t${i}`) && (
                  <div style={{ padding: "0 24px 20px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>💡 Intention</div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 16, padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)" }}>{q.intention}</p>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>✅ Model Answer</div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{q.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Behavioural */}
        {activeSection === "behav" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {report.behaviouralQuestion.map((q, i) => (
              <div key={i} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                <button
                  onClick={() => toggleOpen(`b${i}`)}
                  style={{ width: "100%", padding: "18px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, textAlign: "left" }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }}>Q{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>{q.question}</span>
                  </div>
                  <span style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0, transform: open.has(`b${i}`) ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>⌄</span>
                </button>
                {open.has(`b${i}`) && (
                  <div style={{ padding: "0 24px 20px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>🎯 Trait</div>
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
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{sg.skill}</div>
                  <div style={{ fontSize: 12, color: SEV_COLOR[sg.severity], fontWeight: 600, marginTop: 4 }}>
                    {sg.severity.toUpperCase()} PRIORITY
                  </div>
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
                  <div style={{ marginBottom: 8 }}>
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
