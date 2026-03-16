"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { api } from "../lib/api";
import Toast from "../components/Toast";

interface User {
  _id: string;
  username: string;
  email: string;
}

const RESUME_TEMPLATES = [
  { id: 1, name: "Minimal Pro", tag: "Popular", preview: "▤" },
  { id: 2, name: "Executive", tag: "Premium", preview: "▦" },
  { id: 3, name: "Creative", tag: "New", preview: "▣" },
  { id: 4, name: "Tech Stack", tag: "Dev", preview: "▧" },
];

const ACTIVITY = [
  { label: "Resume updated", time: "2 hours ago", icon: "✏️" },
  { label: "PDF exported", time: "Yesterday", icon: "📄" },
  { label: "ATS scan completed", time: "2 days ago", icon: "🎯" },
  { label: "Account created", time: "3 days ago", icon: "✦" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "resumes" | "settings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchUser = useCallback(async () => {
    const { data, error } = await api.getMe();
    if (error || !data) {
      router.push("/signin");
    } else {
      setUser((data as { user: User }).user);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await api.logout();
    setToast({ message: "Logged out successfully.", type: "success" });
    setTimeout(() => router.push("/"), 1000);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)", flexDirection: "column", gap: "16px",
      }}>
        <div style={{
          width: "40px", height: "40px",
          border: "3px solid var(--border)", borderTopColor: "var(--accent)",
          borderRadius: "50%", animation: "spin-slow 0.9s linear infinite",
        }} />
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Verifying your session…</p>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: "⊞" },
    { id: "resumes", label: "My Resumes", icon: "📄" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)", fontFamily: "var(--font-inter, Inter, sans-serif)" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? "240px" : "64px",
        borderRight: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? "20px 20px 16px" : "20px 14px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "var(--accent)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "var(--accent-text)", fontSize: "16px", fontWeight: "800" }}>R</span>
          </div>
          {sidebarOpen && (
            <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
              ResumeBuddy
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              cursor: "pointer", color: "var(--text-muted)", fontSize: "16px",
              padding: "2px", flexShrink: 0,
            }}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "◂" : "▸"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: sidebarOpen ? "10px 12px" : "10px",
                borderRadius: "10px", border: "none", cursor: "pointer",
                background: activeTab === id ? "var(--accent)" : "transparent",
                color: activeTab === id ? "var(--accent-text)" : "var(--text-secondary)",
                fontSize: "14px", fontWeight: "500",
                transition: "all 0.2s ease",
                textAlign: "left", width: "100%",
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}
              onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.background = "var(--border)"; }}
              onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
            </button>
          ))}
        </nav>

        {/* User info at bottom */}
        {user && (
          <div style={{
            padding: sidebarOpen ? "16px 12px" : "16px 8px",
            borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "var(--border-strong)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: "14px", fontWeight: "700", color: "var(--text-primary)",
            }}>
              {user.username[0].toUpperCase()}
            </div>
            {sidebarOpen && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.username}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>

        {/* Topbar */}
        <header style={{
          height: "60px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
          padding: "0 24px", gap: "16px",
          background: "var(--bg)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {activeTab === "overview" && "Dashboard"}
              {activeTab === "resumes" && "My Resumes"}
              {activeTab === "settings" && "Settings"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: "34px", height: "34px", borderRadius: "9px",
                border: "1px solid var(--border)", background: "var(--bg-secondary)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px",
              }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn btn-ghost"
              style={{ padding: "7px 16px", fontSize: "13px" }}
            >
              {loggingOut ? "…" : "Sign Out"}
            </button>
          </div>
        </header>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <main style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Welcome banner */}
            <div className="glass-card" style={{
              padding: "32px",
              background: "var(--accent)",
              color: "var(--accent-text)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "6px" }}>Welcome back,</p>
                <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "8px" }}>
                  {user?.username} 👋
                </h2>
                <p style={{ fontSize: "14px", opacity: 0.75 }}>
                  Your ATS score is <strong>94/100</strong> — you&apos;re in great shape!
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              {[
                { label: "Resumes", value: "3", icon: "📄", sub: "+1 this week" },
                { label: "Applications", value: "12", icon: "🎯", sub: "4 pending" },
                { label: "Profile Views", value: "48", icon: "👁", sub: "↑ 22% this month" },
                { label: "ATS Score", value: "94", icon: "⚡", sub: "Top 8%" },
              ].map(({ label, value, icon, sub }) => (
                <div key={label} className="glass-card" style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {label}
                    </span>
                    <span style={{ fontSize: "18px" }}>{icon}</span>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.04em", color: "var(--text-primary)", lineHeight: 1 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Activity + Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Recent activity */}
              <div className="glass-card" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px", letterSpacing: "-0.02em" }}>
                  Recent Activity
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {ACTIVITY.map(({ label, time, icon }, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 0",
                      borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "var(--bg-secondary)", border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        fontSize: "14px",
                      }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>{label}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="glass-card" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px", letterSpacing: "-0.02em" }}>
                  Quick Actions
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Create New Resume", icon: "✦", primary: true },
                    { label: "Run ATS Scanner", icon: "🎯", primary: false },
                    { label: "Export as PDF", icon: "📄", primary: false },
                    { label: "Share Resume Link", icon: "🔗", primary: false },
                  ].map(({ label, icon, primary }) => (
                    <button
                      key={label}
                      onClick={() => setActiveTab("resumes")}
                      className={`btn ${primary ? "btn-primary" : "btn-ghost"}`}
                      style={{ justifyContent: "flex-start", width: "100%", padding: "10px 14px", fontSize: "13px" }}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ── RESUMES TAB ── */}
        {activeTab === "resumes" && (
          <main style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.03em" }}>My Resumes</h2>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Manage and edit all your resumes</p>
              </div>
              <button className="btn btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
                + New Resume
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {RESUME_TEMPLATES.map(({ id, name, tag, preview }) => (
                <div
                  key={id}
                  className="glass-card"
                  style={{ padding: "0", cursor: "pointer", overflow: "hidden", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* Preview */}
                  <div style={{
                    height: "160px", background: "var(--bg-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "56px", borderBottom: "1px solid var(--border)",
                    color: "var(--border-strong)",
                  }}>
                    {preview}
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{name}</span>
                      <span style={{
                        fontSize: "10px", fontWeight: "600", padding: "2px 8px",
                        background: "var(--bg-secondary)", border: "1px solid var(--border)",
                        borderRadius: "100px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        {tag}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-primary" style={{ flex: 1, padding: "7px", fontSize: "12px" }}>Edit</button>
                      <button className="btn btn-ghost" style={{ flex: 1, padding: "7px", fontSize: "12px" }}>Export</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new card */}
              <div
                className="glass-card"
                style={{
                  minHeight: "240px", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: "12px",
                  cursor: "pointer", border: "2px dashed var(--border)",
                  background: "transparent", boxShadow: "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "var(--bg-secondary)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  border: "2px dashed var(--border)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "24px", color: "var(--text-muted)",
                }}>
                  +
                </div>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>New Resume</span>
              </div>
            </div>
          </main>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <main style={{ padding: "32px", maxWidth: "640px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "8px" }}>
              Account Settings
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "32px" }}>
              Manage your profile and preferences
            </p>

            {/* Profile card */}
            <div className="glass-card" style={{ padding: "28px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
                Profile
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: "var(--border-strong)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", fontWeight: "800", color: "var(--text-primary)",
                }}>
                  {user?.username?.[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>{user?.username}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Username</label>
                  <input className="input-field" defaultValue={user?.username} readOnly style={{ opacity: 0.7, cursor: "not-allowed" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Email</label>
                  <input className="input-field" defaultValue={user?.email} readOnly style={{ opacity: 0.7, cursor: "not-allowed" }} />
                </div>
              </div>
            </div>

            {/* Theme card */}
            <div className="glass-card" style={{ padding: "28px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
                Appearance
              </h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Theme</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Currently: {theme === "dark" ? "Dark mode 🌙" : "Light mode ☀️"}
                  </div>
                </div>
                <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: "8px 20px", fontSize: "13px" }}>
                  Switch to {theme === "dark" ? "Light" : "Dark"}
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="glass-card" style={{ padding: "28px", border: "1px solid rgba(239,68,68,0.2)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
                Danger Zone
              </h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Sign out</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                    You will be redirected to the home page.
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    padding: "8px 20px", fontSize: "13px",
                    background: "none", border: "1px solid #ef4444",
                    color: "#ef4444", borderRadius: "10px", cursor: "pointer",
                    fontWeight: "600", transition: "all 0.2s ease",
                  }}
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
