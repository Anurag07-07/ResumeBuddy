"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { api } from "../lib/api";
import Toast from "../components/Toast";

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  if (!password) return null;
  const strength = getStrength();
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: "3px", borderRadius: "2px",
              background: i <= strength ? colors[strength] : "var(--border)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: "12px", color: colors[strength], fontWeight: "500" }}>
        {labels[strength]}
      </span>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setToast({ message: "Please fill in all fields.", type: "error" });
      return;
    }
    if (!agreed) {
      setToast({ message: "Please agree to the Terms & Privacy Policy.", type: "error" });
      return;
    }
    if (form.password.length < 6) {
      setToast({ message: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    setLoading(true);
    const { error } = await api.signup(form);
    setLoading(false);
    if (error) {
      setToast({ message: error, type: "error" });
    } else {
      setToast({ message: "Account created! Redirecting…", type: "success" });
      setTimeout(() => router.push("/dashboard"), 1000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      {/* ── Left decorative panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-secondary)",
          padding: "60px",
          borderRight: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            opacity: 0.6,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "380px" }}>
          <Link
            href="/"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", marginBottom: "48px" }}
          >
            <div style={{
              width: "28px", height: "28px", background: "var(--accent)", borderRadius: "7px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "var(--accent-text)", fontSize: "14px", fontWeight: "800" }}>R</span>
            </div>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              ResumeBuddy
            </span>
          </Link>

          <h2 style={{
            fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: "800",
            letterSpacing: "-0.04em", lineHeight: 1.1,
            color: "var(--text-primary)", marginBottom: "16px",
          }}>
            Build a resume<br />you&apos;re proud of.
          </h2>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "40px" }}>
            Join 50,000+ professionals who built stunning, ATS-ready resumes.
          </p>

          {[
            "AI-powered content suggestions",
            "50+ professional templates",
            "ATS optimisation built-in",
            "One-click PDF export",
            "Free forever plan",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ color: "var(--accent-text)", fontSize: "11px", fontWeight: "700" }}>✓</span>
              </div>
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: form ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px", position: "relative",
      }}>
        {/* theme toggle */}
        <div style={{ position: "absolute", top: "24px", right: "24px" }}>
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
        </div>

        <div className="animate-fade-up glass-card" style={{ width: "100%", maxWidth: "420px", padding: "40px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "8px" }}>
              Create account
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Start building your perfect resume today
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Username */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Username
              </label>
              <input
                id="signup-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Email address
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
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
              <PasswordStrength password={form.password} />
            </div>

            {/* Terms */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", marginTop: "4px" }}>
              <input
                id="signup-terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "var(--accent)", width: "15px", height: "15px" }}
              />
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                I agree to the{" "}
                <a href="#" style={{ color: "var(--text-primary)", fontWeight: "600", textDecoration: "none" }}>Terms</a>
                {" "}and{" "}
                <a href="#" style={{ color: "var(--text-primary)", fontWeight: "600", textDecoration: "none" }}>Privacy Policy</a>
              </span>
            </label>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "8px", padding: "14px", fontSize: "15px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                  <span style={{
                    width: "16px", height: "16px",
                    border: "2px solid var(--accent-text)", borderTopColor: "transparent",
                    borderRadius: "50%", animation: "spin-slow 0.8s linear infinite", display: "inline-block",
                  }} />
                  Creating account…
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <div className="divider" style={{ margin: "24px 0" }}>or</div>
          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/signin" style={{ color: "var(--text-primary)", fontWeight: "600", textDecoration: "none" }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
