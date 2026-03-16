"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { api } from "../lib/api";
import Toast from "../components/Toast";

export default function SignInPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setToast({ message: "Please fill in all fields.", type: "error" });
      return;
    }
    setLoading(true);
    const { error } = await api.signin(form);
    setLoading(false);
    if (error) {
      setToast({ message: error, type: "error" });
    } else {
      setToast({ message: "Welcome back! Redirecting...", type: "success" });
      setTimeout(() => router.push("/dashboard"), 1000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--bg)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Top bar */}
        <div style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          right: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px",
              background: "var(--accent)", borderRadius: "7px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "var(--accent-text)", fontSize: "14px", fontWeight: "800" }}>R</span>
            </div>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              ResumeBuddy
            </span>
          </Link>

          <button onClick={toggleTheme} aria-label="Toggle theme" style={{
            width: "34px", height: "34px", borderRadius: "9px",
            border: "1px solid var(--border)", background: "var(--bg-secondary)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", transition: "all 0.2s ease",
          }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Form card */}
        <div className="animate-fade-up glass-card" style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px",
        }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{
              fontSize: "28px", fontWeight: "800",
              letterSpacing: "-0.03em", color: "var(--text-primary)",
              marginBottom: "8px",
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Sign in to continue building your career
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "0.01em" }}>
                Username
              </label>
              <input
                id="signin-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "0.01em" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signin-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "var(--text-muted)",
                    fontSize: "13px", fontWeight: "500",
                  }}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              id="signin-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "8px", padding: "14px", fontSize: "15px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    width: "16px", height: "16px",
                    border: "2px solid var(--accent-text)",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin-slow 0.8s linear infinite",
                    display: "inline-block",
                  }} />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <div className="divider" style={{ margin: "24px 0" }}>or</div>

          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--text-primary)", fontWeight: "600", textDecoration: "none" }}>
              Create one →
            </Link>
          </p>
        </div>
      </div>

      {/* Right decorative panel */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--accent)",
        padding: "60px",
        gap: "32px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid pattern for dark panel */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "var(--accent-text)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>✦</div>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "800", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "16px" }}>
            Your next opportunity<br />starts here.
          </h2>
          <p style={{ fontSize: "15px", opacity: 0.7, lineHeight: "1.7", maxWidth: "320px" }}>
            Over 50,000 professionals trust ResumeBuddy to craft resumes that stand out and get results.
          </p>
        </div>

        {/* Testimonial card */}
        <div style={{
          position: "relative", zIndex: 1,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "14px",
          padding: "24px",
          maxWidth: "340px",
          backdropFilter: "blur(10px)",
        }}>
          <p style={{ fontSize: "14px", color: "var(--accent-text)", opacity: 0.85, lineHeight: "1.7", fontStyle: "italic", marginBottom: "16px" }}>
            &quot;I got 3 interview calls in the first week after updating my resume with ResumeBuddy. Incredible tool!&quot;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>
              A
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent-text)" }}>Anurag R.</div>
              <div style={{ fontSize: "12px", opacity: 0.6, color: "var(--accent-text)" }}>Software Engineer</div>
            </div>
            <div style={{ marginLeft: "auto", color: "#facc15", fontSize: "13px" }}>★★★★★</div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
