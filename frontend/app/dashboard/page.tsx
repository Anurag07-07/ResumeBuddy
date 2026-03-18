"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { api, type ReportSummary, type FullReport, type PrepDay } from "../lib/api";
import Toast from "../components/Toast";

interface User { _id: string; username: string; email: string; }

// ── helpers ──────────────────────────────────────────────────────────────────
function scoreColor(s: number) { return s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444"; }
function scoreLabel(s: number) { return s >= 75 ? "Strong" : s >= 50 ? "Good" : "Needs Work"; }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function getGreeting(hour: number) {
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (hour < 21) return { text: "Good evening", emoji: "🌆" };
  return { text: "Good night", emoji: "🌙" };
}

// Safe parser for prep plan items from old records
function tryParse(s: string) { try { return JSON.parse(s); } catch { return null; } }
function parsePrepPlan(raw: any[]): PrepDay[] {
  return raw.map((p) => {
    if (typeof p === "string") return tryParse(p) ?? p;
    return p;
  }).filter(Boolean) as PrepDay[];
}

// ── Mini SVG Bar Chart ────────────────────────────────────────────────────────
function ScoreChart({ reports }: { reports: ReportSummary[] }) {
  const data = [...reports].reverse().slice(-7); // oldest → newest, max 7
  const max = 100;
  const W = 600, H = 160, PAD = { top: 16, right: 16, bottom: 32, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barW = Math.min(48, (chartW / data.length) - 10);

  if (data.length === 0) return null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      {/* Y-axis gridlines */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = PAD.top + chartH - (v / max) * chartH;
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke="var(--border)" strokeWidth={1} strokeDasharray={v === 0 ? "0" : "4 4"} />
            <text x={PAD.left - 6} y={y + 4} fill="var(--text-muted)" fontSize={9} textAnchor="end">{v}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((r, i) => {
        const slotW = chartW / data.length;
        const cx = PAD.left + slotW * i + slotW / 2;
        const barH = (r.matchScore / max) * chartH;
        const y = PAD.top + chartH - barH;
        const color = scoreColor(r.matchScore);
        const label = new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

        return (
          <g key={r._id}>
            {/* Bar background */}
            <rect x={cx - barW / 2} y={PAD.top} width={barW} height={chartH}
              rx={6} fill="var(--bg)" opacity={0.4} />
            {/* Filled bar */}
            <rect x={cx - barW / 2} y={y} width={barW} height={barH}
              rx={6} fill={color} opacity={0.85} />
            {/* Score label inside bar */}
            {barH > 22 && (
              <text x={cx} y={y + 14} fill="white" fontSize={10} fontWeight="700" textAnchor="middle">
                {r.matchScore}
              </text>
            )}
            {/* Date below */}
            <text x={cx} y={H - 4} fill="var(--text-muted)" fontSize={9} textAnchor="middle">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Trend line chart ──────────────────────────────────────────────────────────
function TrendLine({ reports }: { reports: ReportSummary[] }) {
  const data = [...reports].reverse().slice(-7);
  if (data.length < 2) return null;
  const W = 600, H = 60;
  const scores = data.map(r => r.matchScore);
  const min = Math.min(...scores) - 5;
  const max = 105;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * W;
    const y = H - ((s - min) / (max - min)) * H;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 40, overflow: "visible" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts.join(" ")} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Focus Task Card ───────────────────────────────────────────────────────────
const FOCUS_COLOR: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
const FOCUS_BG: Record<string, string> = { high: "rgba(239,68,68,0.08)", medium: "rgba(245,158,11,0.08)", low: "rgba(34,197,94,0.08)" };

function FocusTask({ plan, day }: { plan: PrepDay; day: number }) {
  const color = FOCUS_COLOR[plan.focus] ?? "#888";
  const bg = FOCUS_BG[plan.focus] ?? "var(--bg-secondary)";
  return (
    <div style={{
      padding: "14px 18px", borderRadius: 12,
      background: bg,
      border: `1px solid ${color}30`,
      display: "flex", gap: 14, alignItems: "flex-start",
    }}>
      <div style={{
        minWidth: 36, height: 36, borderRadius: 9,
        background: color, color: "white",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 11, fontWeight: 800, lineHeight: 1.1,
      }}>
        <span>D{day}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color,
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4,
        }}>
          {plan.focus} priority
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
          {plan.tasks}
        </p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "settings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [latestReport, setLatestReport] = useState<FullReport | null>(null);
  const [latestLoading, setLatestLoading] = useState(false);

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchUser = useCallback(async () => {
    const { data, error } = await api.getMe();
    if (error || !data) { router.push("/signin"); }
    else { setUser((data as any).user); }
    setLoading(false);
  }, [router]);

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    const { data } = await api.getReports();
    if (data?.data) setReports(data.data);
    setReportsLoading(false);
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (!loading) fetchReports(); }, [loading, fetchReports]);

  // Fetch full latest report for prep plan tasks
  useEffect(() => {
    if (reports.length === 0) return;
    const latest = reports[0]; // already sorted newest-first
    setLatestLoading(true);
    api.getReportById(latest._id).then(({ data }) => {
      if (data?.data) setLatestReport(data.data);
      setLatestLoading(false);
    });
  }, [reports]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await api.logout();
    setToast({ message: "Logged out successfully.", type: "success" });
    setTimeout(() => router.push("/"), 1000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin-slow 0.9s linear infinite" }} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Verifying your session…</p>
      </div>
    );
  }

  // ── derived data ─────────────────────────────────────────────────────────
  const avgScore = reports.length
    ? Math.round(reports.reduce((s, r) => s + r.matchScore, 0) / reports.length)
    : 0;
  const bestScore = reports.length ? Math.max(...reports.map(r => r.matchScore)) : 0;
  const hour = now.getHours();
  const greeting = getGreeting(hour);

  const localTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const localDate = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const prepPlan = latestReport
    ? parsePrepPlan(latestReport.preparationPlan as any[])
    : [];
  // Show first 3 tasks from the plan
  const focusTasks = prepPlan.slice(0, 3);

  const navItems = [
    { id: "overview", label: "Overview",     icon: "⊞" },
    { id: "reports",  label: "My Reports",   icon: "📋" },
    { id: "settings", label: "Settings",     icon: "⚙" },
  ] as const;

  // ── Score trend description ───────────────────────────────────────────────
  let trendMsg = "";
  if (reports.length >= 2) {
    const diff = reports[0].matchScore - reports[1].matchScore;
    trendMsg = diff > 0
      ? `↑ +${diff} pts vs last report`
      : diff < 0
        ? `↓ ${diff} pts vs last report`
        : "= Same as last report";
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)", fontFamily: "var(--font-inter, Inter, sans-serif)" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? "240px" : "64px",
        borderRight: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? "20px 20px 16px" : "20px 14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--accent-text)", fontSize: 16, fontWeight: 800 }}>R</span>
          </div>
          {sidebarOpen && <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>ResumeBuddy</span>}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16, padding: 2, flexShrink: 0 }}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "◂" : "▸"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: sidebarOpen ? "10px 12px" : "10px",
                borderRadius: 10, border: "none", cursor: "pointer",
                background: activeTab === id ? "var(--accent)" : "transparent",
                color: activeTab === id ? "var(--accent-text)" : "var(--text-secondary)",
                fontSize: 14, fontWeight: 500, transition: "all 0.2s ease",
                textAlign: "left", width: "100%",
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}
              onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.background = "var(--border)"; }}
              onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
            </button>
          ))}

          {/* New Analysis — separate CTA */}
          <div style={{ marginTop: 8 }}>
            <Link href="/interview" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: sidebarOpen ? "10px 12px" : "10px",
                borderRadius: 10, cursor: "pointer",
                background: "var(--accent)", opacity: 0.85,
                color: "var(--accent-text)",
                fontSize: 14, fontWeight: 600,
                justifyContent: sidebarOpen ? "flex-start" : "center",
                transition: "opacity 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>🎯</span>
                {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>New Analysis</span>}
              </div>
            </Link>
          </div>
        </nav>

        {/* User at bottom */}
        {user && (
          <div style={{ padding: sidebarOpen ? "16px 12px" : "16px 8px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: 14, fontWeight: 800, color: "white",
            }}>
              {user.username[0].toUpperCase()}
            </div>
            {sidebarOpen && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.username}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>

        {/* Topbar */}
        <header style={{ height: 60, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, background: "var(--bg)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {activeTab === "overview" && "Dashboard"}
              {activeTab === "reports"  && "My Reports"}
              {activeTab === "settings" && "Settings"}
            </h1>
          </div>
          {/* Live clock in topbar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.01em", fontVariantNumeric: "tabular-nums" }}>{localTime}</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{timezone}</span>
          </div>
          <div style={{ width: 1, height: 24, background: "var(--border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={toggleTheme} aria-label="Toggle theme" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button id="logout-btn" onClick={handleLogout} disabled={loggingOut} className="btn btn-ghost" style={{ padding: "7px 16px", fontSize: 13 }}>
              {loggingOut ? "…" : "Sign Out"}
            </button>
          </div>
        </header>

        {/* ══════════════════════════ OVERVIEW TAB ══════════════════════════ */}
        {activeTab === "overview" && (
          <main style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 1200, width: "100%" }}>

            {/* ── Welcome Banner ── */}
            <div style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, var(--accent) 0%, #7c3aed 55%, #a855f7 100%)",
              padding: "28px 36px",
              position: "relative", overflow: "hidden",
              color: "white",
            }}>
              {/* Decorative grid */}
              <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
              {/* Glow orbs */}
              <div style={{ position: "absolute", top: -40, right: 80, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -60, right: -20, width: 240, height: 240, borderRadius: "50%", background: "rgba(139,92,246,0.35)", pointerEvents: "none" }} />

              <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                <div>
                  <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, fontWeight: 500 }}>
                    {greeting.emoji} {greeting.text}
                  </p>
                  <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6, lineHeight: 1.1 }}>
                    {user?.username}!
                  </h2>
                  <p style={{ fontSize: 13.5, opacity: 0.8, marginBottom: 14 }}>
                    {reports.length > 0
                      ? `You've completed ${reports.length} resume ${reports.length > 1 ? "analyses" : "analysis"}. Keep pushing! 🚀`
                      : "Start your first resume analysis to get interview-ready!"}
                  </p>
                  {/* Date + timezone pill */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 500 }}>
                    <span>📅</span>
                    <span>{localDate}</span>
                    <span style={{ opacity: 0.6 }}>·</span>
                    <span style={{ opacity: 0.7 }}>{timezone}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
                  {/* Big clock display */}
                  <div style={{
                    fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.04em",
                    lineHeight: 1, opacity: 0.95,
                    fontVariantNumeric: "tabular-nums",
                    textShadow: "0 2px 16px rgba(0,0,0,0.2)",
                  }}>
                    {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).replace(" am", "").replace(" pm", "")}
                    <span style={{ fontSize: "1.1rem", opacity: 0.7, marginLeft: 6 }}>
                      {now.toLocaleTimeString("en-IN", { hour12: true }).slice(-2).toUpperCase()}
                    </span>
                  </div>
                  <Link href="/interview" style={{ textDecoration: "none" }}>
                    <button style={{
                      padding: "10px 22px", borderRadius: 10,
                      background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
                      color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      backdropFilter: "blur(8px)",
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                    >
                      🎯 Analyse Resume →
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Stat cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
              {[
                { label: "Total Reports", value: String(reports.length), icon: "📋", sub: "analyses done", color: "#6366f1" },
                { label: "Avg Match Score", value: reports.length ? `${avgScore}` : "—", suffix: "%", icon: "🎯", sub: "across all reports", color: "#f59e0b" },
                { label: "Best Score",  value: reports.length ? `${bestScore}` : "—", suffix: "%", icon: "🏆", sub: "highest match", color: "#22c55e" },
                { label: "Latest",      value: reports.length ? formatDate(reports[0].createdAt) : "—", icon: "📅", sub: "most recent", color: "#a855f7" },
              ].map(({ label, value, icon, sub, color, suffix }) => (
                <div key={label} className="glass-card" style={{ padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -10, right: -10, fontSize: 40, opacity: 0.07 }}>{icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>{label}</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, marginBottom: 4 }}>
                    <span style={{ fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.04em", color, lineHeight: 1 }}>{value}</span>
                    {suffix && <span style={{ fontSize: 14, fontWeight: 700, color, lineHeight: 1, marginBottom: 3 }}>{suffix}</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{sub}</div>
                  {trendMsg && label === "Latest" && (
                    <div style={{ fontSize: 11, color: reports[0]?.matchScore > (reports[1]?.matchScore ?? 0) ? "#22c55e" : "#ef4444", marginTop: 4, fontWeight: 600 }}>
                      {trendMsg}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Chart + Focus tasks row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

              {/* Score Chart */}
              <div className="glass-card" style={{ padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Score History</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Last {Math.min(reports.length, 7)} reports</p>
                  </div>
                  {reports.length >= 2 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                      background: reports[0].matchScore >= reports[1].matchScore ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: reports[0].matchScore >= reports[1].matchScore ? "#22c55e" : "#ef4444",
                    }}>
                      {trendMsg}
                    </span>
                  )}
                </div>
                {reports.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
                    No reports yet. <Link href="/interview" style={{ color: "var(--accent)" }}>Start one →</Link>
                  </div>
                ) : (
                  <ScoreChart reports={reports} />
                )}
              </div>

              {/* Today's Focus Tasks */}
              <div className="glass-card" style={{ padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>📌 Your Prep Plan</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>From your latest report</p>
                  </div>
                  {latestReport && (
                    <Link href={`/reports/${latestReport._id}`} style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                      View full →
                    </Link>
                  )}
                </div>

                {latestLoading || reportsLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ height: 60, borderRadius: 12, background: "var(--border)", opacity: 0.4, animation: "pulse 1.5s ease-in-out infinite" }} />
                    ))}
                  </div>
                ) : focusTasks.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)", fontSize: 13 }}>
                    {reports.length === 0
                      ? <span>No prep plan yet. <Link href="/interview" style={{ color: "var(--accent)" }}>Analyse your resume →</Link></span>
                      : "Prep plan unavailable for this report."}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {focusTasks.map((t, i) => (
                      <FocusTask key={i} plan={t} day={t.day ?? i + 1} />
                    ))}
                    {prepPlan.length > 3 && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
                        +{prepPlan.length - 3} more days in the plan
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Recent Reports ── */}
            <div className="glass-card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Recent Reports</h3>
                <button onClick={() => setActiveTab("reports")} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
              </div>
              {reportsLoading ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
              ) : reports.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>No reports yet.</p>
                  <Link href="/interview" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}>Start Analysis</Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {reports.slice(0, 6).map((r) => (
                    <Link key={r._id} href={`/reports/${r._id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px", borderRadius: 12,
                        background: "var(--bg)", border: "1px solid var(--border)",
                        cursor: "pointer", transition: "all 0.18s ease",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {/* Score ring */}
                        <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
                          <circle cx={22} cy={22} r={17} fill="none" stroke="var(--border)" strokeWidth={3.5} />
                          <circle cx={22} cy={22} r={17} fill="none"
                            stroke={scoreColor(r.matchScore)} strokeWidth={3.5}
                            strokeDasharray={`${(r.matchScore / 100) * 107} 107`}
                            strokeLinecap="round" transform="rotate(-90 22 22)" />
                          <text x={22} y={26} textAnchor="middle" fontSize={10} fontWeight="800" fill={scoreColor(r.matchScore)}>{r.matchScore}</text>
                        </svg>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", marginBottom: 2 }}>
                            {r.jobDescription.slice(0, 55)}…
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100, background: `${scoreColor(r.matchScore)}18`, color: scoreColor(r.matchScore) }}>
                              {scoreLabel(r.matchScore)}
                            </span>
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatDate(r.createdAt)}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0 }}>›</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
        )}

        {/* ══════════════════════════ REPORTS TAB ══════════════════════════ */}
        {activeTab === "reports" && (
          <main style={{ padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>My Reports</h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{reports.length} total analyses</p>
              </div>
              <Link href="/interview" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>+ New Analysis</Link>
            </div>

            {reportsLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>Loading reports…</div>
            ) : reports.length === 0 ? (
              <div className="glass-card" style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No analyses yet</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Upload your resume and a job description to get started.</p>
                <Link href="/interview" className="btn btn-primary" style={{ padding: "10px 22px" }}>Start Analysis →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reports.map((r) => (
                  <Link key={r._id} href={`/reports/${r._id}`} style={{ textDecoration: "none" }}>
                    <div className="glass-card" style={{ padding: "20px 24px", display: "flex", gap: 20, alignItems: "center", cursor: "pointer", transition: "transform 0.2s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "translateX(4px)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "translateX(0)")}>
                      <svg width={54} height={54} viewBox="0 0 54 54" style={{ flexShrink: 0 }}>
                        <circle cx={27} cy={27} r={22} fill="none" stroke="var(--border)" strokeWidth={4} />
                        <circle cx={27} cy={27} r={22} fill="none"
                          stroke={scoreColor(r.matchScore)} strokeWidth={4}
                          strokeDasharray={`${(r.matchScore / 100) * 138} 138`}
                          strokeLinecap="round" transform="rotate(-90 27 27)" />
                        <text x={27} y={31} textAnchor="middle" fontSize={13} fontWeight="800" fill={scoreColor(r.matchScore)}>{r.matchScore}</text>
                      </svg>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: `${scoreColor(r.matchScore)}22`, color: scoreColor(r.matchScore) }}>{scoreLabel(r.matchScore)} Match</span>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(r.createdAt)}</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                          {r.jobDescription.slice(0, 120)}…
                        </p>
                      </div>
                      <span style={{ fontSize: 16, color: "var(--text-muted)" }}>›</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        )}

        {/* ══════════════════════════ SETTINGS TAB ══════════════════════════ */}
        {activeTab === "settings" && (
          <main style={{ padding: 32, maxWidth: 640 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 8 }}>Account Settings</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>Manage your profile and preferences</p>

            <div className="glass-card" style={{ padding: 28, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Profile</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "white" }}>
                  {user?.username?.[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{user?.username}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Username</label>
                  <input className="input-field" defaultValue={user?.username} readOnly style={{ opacity: 0.7, cursor: "not-allowed" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Email</label>
                  <input className="input-field" defaultValue={user?.email} readOnly style={{ opacity: 0.7, cursor: "not-allowed" }} />
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 28, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Appearance</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Theme</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Currently: {theme === "dark" ? "Dark mode 🌙" : "Light mode ☀️"}</div>
                </div>
                <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: "8px 20px", fontSize: 13 }}>
                  Switch to {theme === "dark" ? "Light" : "Dark"}
                </button>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 28, border: "1px solid rgba(239,68,68,0.2)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Danger Zone</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Sign out</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>You will be redirected to the home page.</div>
                </div>
                <button
                  onClick={handleLogout} disabled={loggingOut}
                  style={{ padding: "8px 20px", fontSize: 13, background: "none", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 10, cursor: "pointer", fontWeight: 600, transition: "all 0.2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#ef4444"; }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </main>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
