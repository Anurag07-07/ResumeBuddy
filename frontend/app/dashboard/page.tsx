"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { api, type ReportSummary } from "../lib/api";
import Toast from "../components/Toast";

interface User { _id: string; username: string; email: string; }

function scoreColor(s: number) { return s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444"; }
function scoreLabel(s: number) { return s >= 75 ? "Strong" : s >= 50 ? "Good" : "Weak"; }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "interview" | "settings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

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

  const navItems = [
    { id: "overview",  label: "Overview",          icon: "⊞" },
    { id: "reports",   label: "My Reports",         icon: "📋" },
    { id: "interview", label: "New Analysis",       icon: "🎯" },
    { id: "settings",  label: "Settings",           icon: "⚙" },
  ] as const;

  const avgScore = reports.length
    ? Math.round(reports.reduce((s, r) => s + r.matchScore, 0) / reports.length)
    : 0;

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
              onClick={() => { if (id === "interview") { router.push("/interview"); } else { setActiveTab(id); } }}
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
        </nav>

        {/* User at bottom */}
        {user && (
          <div style={{ padding: sidebarOpen ? "16px 12px" : "16px 8px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
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

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>

        {/* Topbar */}
        <header style={{ height: 60, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, background: "var(--bg)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {activeTab === "overview" && "Dashboard"}
              {activeTab === "reports" && "My Reports"}
              {activeTab === "settings" && "Settings"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={toggleTheme} aria-label="Toggle theme" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button id="logout-btn" onClick={handleLogout} disabled={loggingOut} className="btn btn-ghost" style={{ padding: "7px 16px", fontSize: 13 }}>
              {loggingOut ? "…" : "Sign Out"}
            </button>
          </div>
        </header>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <main style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Welcome */}
            <div className="glass-card" style={{ padding: "32px", background: "var(--accent)", color: "var(--accent-text)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 6 }}>Welcome back,</p>
                  <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>{user?.username} 👋</h2>
                  <p style={{ fontSize: 14, opacity: 0.75 }}>
                    {reports.length > 0
                      ? `You have ${reports.length} analysis report${reports.length > 1 ? "s" : ""}. Average match score: ${avgScore}/100`
                      : "Start your first resume analysis to get interview-ready!"}
                  </p>
                </div>
                <Link href="/interview" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    🎯 Analyse Resume →
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              {[
                { label: "Analyses", value: String(reports.length), icon: "📋", sub: "total reports" },
                { label: "Avg Match Score", value: reports.length ? `${avgScore}%` : "—", icon: "🎯", sub: "across all reports" },
                { label: "Best Score", value: reports.length ? `${Math.max(...reports.map(r => r.matchScore))}%` : "—", icon: "🏆", sub: "highest match" },
                { label: "Latest Analysis", value: reports.length ? formatDate(reports[0].createdAt) : "—", icon: "📅", sub: "most recent" },
              ].map(({ label, value, icon, sub }) => (
                <div key={label} className="glass-card" style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Recent reports + quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Recent reports */}
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Recent Reports</h3>
                  <button onClick={() => setActiveTab("reports")} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>View all</button>
                </div>
                {reportsLoading ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
                ) : reports.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>No reports yet.</p>
                    <Link href="/interview" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}>Start Analysis</Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {reports.slice(0, 4).map((r, i) => (
                      <Link key={r._id} href={`/reports/${r._id}`} style={{ textDecoration: "none" }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 0",
                          borderBottom: i < Math.min(reports.length, 4) - 1 ? "1px solid var(--border)" : "none",
                          cursor: "pointer",
                        }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${scoreColor(r.matchScore)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: scoreColor(r.matchScore) }}>{r.matchScore}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {r.jobDescription.slice(0, 50)}…
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(r.createdAt)}</div>
                          </div>
                          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>›</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, letterSpacing: "-0.02em" }}>Quick Actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Analyse My Resume", icon: "🎯", href: "/interview", primary: true },
                    { label: "View All Reports", icon: "📋", href: "/reports", primary: false },
                    { label: "Account Settings", icon: "⚙", href: null, primary: false, onClick: () => setActiveTab("settings") },
                  ].map(({ label, icon, href, primary, onClick }) => (
                    href ? (
                      <Link key={label} href={href} className={`btn ${primary ? "btn-primary" : "btn-ghost"}`} style={{ justifyContent: "flex-start", width: "100%", padding: "10px 14px", fontSize: 13 }}>
                        <span>{icon}</span> {label}
                      </Link>
                    ) : (
                      <button key={label} onClick={onClick} className={`btn ${primary ? "btn-primary" : "btn-ghost"}`} style={{ justifyContent: "flex-start", width: "100%", padding: "10px 14px", fontSize: 13 }}>
                        <span>{icon}</span> {label}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && (
          <main style={{ padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>My Reports</h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{reports.length} total analyses</p>
              </div>
              <Link href="/interview" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>
                + New Analysis
              </Link>
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
                      <div style={{ width: 52, height: 52, borderRadius: "50%", border: `3px solid ${scoreColor(r.matchScore)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor(r.matchScore), letterSpacing: "-0.04em" }}>{r.matchScore}</span>
                        <span style={{ fontSize: 8, color: "var(--text-muted)" }}>/ 100</span>
                      </div>
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

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <main style={{ padding: 32, maxWidth: 640 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 8 }}>Account Settings</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>Manage your profile and preferences</p>

            {/* Profile */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Profile</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
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

            {/* Appearance */}
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

            {/* Danger zone */}
            <div className="glass-card" style={{ padding: 28, border: "1px solid rgba(239,68,68,0.2)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Danger Zone</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Sign out</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>You will be redirected to the home page.</div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
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
