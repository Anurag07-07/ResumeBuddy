"use client";
import Link from "next/link";
import Navbar from "./components/Navbar";

const features = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    desc: "Generate a polished resume in seconds with AI-assisted content suggestions tailored to your industry.",
  },
  {
    icon: "🎯",
    title: "ATS Optimized",
    desc: "Built to pass Applicant Tracking Systems. Every template is keyword-rich and machine-readable.",
  },
  {
    icon: "✦",
    title: "Pro Templates",
    desc: "Choose from dozens of recruiter-approved designs crafted by career experts and top designers.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "Your data is encrypted and never shared. JWT + Redis-powered auth keeps your account safe.",
  },
  {
    icon: "📊",
    title: "Analytics",
    desc: "Track resume views and application performance to understand what gets you callbacks.",
  },
  {
    icon: "🌐",
    title: "One-click Export",
    desc: "Export to PDF, DOCX, or share a live link — all with perfect formatting preserved.",
  },
];

const steps = [
  { num: "01", title: "Create Your Account", desc: "Sign up in 10 seconds. No credit card required." },
  { num: "02", title: "Fill In Your Details", desc: "Add your experience, skills, and goals. Our AI fills the gaps." },
  { num: "03", title: "Choose a Template", desc: "Pick from our curated, professional designs." },
  { num: "04", title: "Download & Apply", desc: "Export your resume and start landing interviews." },
];

const stats = [
  { value: "50K+", label: "Resumes Built" },
  { value: "87%", label: "Interview Rate" },
  { value: "4.9★", label: "User Rating" },
  { value: "200+", label: "Templates" },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.5,
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
        }} />

        {/* Glowing orb */}
        <div style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, var(--border-strong) 0%, transparent 70%)",
          opacity: 0.4,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "860px" }}>
          <div className="badge animate-fade-up" style={{ marginBottom: "24px" }}>
            <span style={{
              width: "6px", height: "6px",
              background: "#22c55e",
              borderRadius: "50%",
              animation: "pulse-dot 2s infinite"
            }} />
            New — AI Resume Generator v2.0
          </div>

          <h1 className="animate-fade-up delay-100" style={{
            fontSize: "clamp(2.8rem, 7vw, 6rem)",
            fontWeight: "800",
            lineHeight: "1.05",
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            marginBottom: "28px",
          }}>
            Resumes that{" "}
            <span className="shimmer-text">get you hired.</span>
          </h1>

          <p className="animate-fade-up delay-200" style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "var(--text-secondary)",
            lineHeight: "1.7",
            marginBottom: "48px",
            maxWidth: "580px",
            margin: "0 auto 48px",
          }}>
            Build ATS-friendly, recruiter-approved resumes in minutes using AI.
            Join 50,000+ professionals who landed their dream jobs with ResumeBuddy.
          </p>

          <div className="animate-fade-up delay-300" style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start for Free →
            </Link>
            <Link href="/signin" className="btn btn-ghost btn-lg">
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-up delay-400" style={{
            marginTop: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}>
            <span>✓ No credit card required</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>✓ Free forever plan</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>

        {/* Hero card preview */}
        <div className="animate-fade-up delay-500 animate-float" style={{
          marginTop: "80px",
          position: "relative",
          zIndex: 1,
        }}>
          <div className="glass-card" style={{
            width: "min(720px, 90vw)",
            padding: "32px",
            display: "flex",
            gap: "24px",
            textAlign: "left",
          }}>
            {/* Left: Resume mock */}
            <div style={{
              flex: 1,
              background: "var(--bg-secondary)",
              borderRadius: "10px",
              padding: "20px",
              border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--border-strong)" }} />
                <div>
                  <div style={{ width: "120px", height: "10px", background: "var(--text-primary)", borderRadius: "4px", marginBottom: "6px", opacity: 0.8 }} />
                  <div style={{ width: "80px", height: "8px", background: "var(--border-strong)", borderRadius: "4px" }} />
                </div>
              </div>
              {[100, 90, 95, 70, 85].map((w, i) => (
                <div key={i} style={{
                  height: "8px",
                  width: `${w}%`,
                  background: i === 0 ? "var(--text-primary)" : "var(--border)",
                  borderRadius: "4px",
                  marginBottom: "10px",
                  opacity: i === 0 ? 0.6 : 1,
                }} />
              ))}
              <div style={{
                marginTop: "16px",
                padding: "8px 0",
                borderTop: "1px solid var(--border)",
              }}>
                {[80, 60, 70].map((w, i) => (
                  <div key={i} style={{
                    height: "7px",
                    width: `${w}%`,
                    background: "var(--border)",
                    borderRadius: "4px",
                    marginBottom: "8px",
                  }} />
                ))}
              </div>
            </div>

            {/* Right: AI panel */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                AI Suggestions
              </div>
              {["Strengthen your summary ✦", "Add missing keywords 🎯", "Improve action verbs ⚡", "ATS Score: 94/100 ✓"].map((item, i) => (
                <div key={i} style={{
                  padding: "10px 14px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: i === 3 ? "#22c55e" : "var(--text-secondary)",
                  fontWeight: i === 3 ? "600" : "400",
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        padding: "60px 24px",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-secondary)",
      }}>
        <div style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "40px",
          textAlign: "center",
        }}>
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-0.04em", color: "var(--text-primary)", lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px", fontWeight: "500" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="badge" style={{ marginBottom: "16px" }}>✦ Features</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800", letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}>
              Everything you need to<br />land your dream job
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {features.map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className="glass-card"
                style={{ padding: "28px", cursor: "default" }}
              >
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  marginBottom: "16px",
                }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "10px", letterSpacing: "-0.02em" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.65" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{
        padding: "100px 24px",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="badge" style={{ marginBottom: "16px" }}>⚡ Process</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800", letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}>
              Up and running in minutes
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {steps.map(({ num, title, desc }, i) => (
              <div
                key={num}
                style={{
                  display: "flex",
                  gap: "32px",
                  padding: "32px",
                  borderRadius: "16px",
                  alignItems: "flex-start",
                  transition: "background 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  fontWeight: "800",
                  letterSpacing: "-0.04em",
                  color: "var(--border-strong)",
                  minWidth: "64px",
                  lineHeight: 1,
                }}>
                  {num}
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.65" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "120px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            fontWeight: "800",
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            lineHeight: 1.05,
            marginBottom: "24px",
          }}>
            Ready to get hired?
          </h2>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "40px" }}>
            Join thousands of professionals who built better resumes and landed better jobs.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Create Your Resume — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "32px 24px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          © 2026 ResumeBuddy. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy", "Terms", "Contact"].map(item => (
            <a key={item} href="#" style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
