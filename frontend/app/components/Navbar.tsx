"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { api } from "../lib/api";

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    api.getMe().then(({ data }) => {
      if (data) {
        setIsLoggedIn(true);
        setUsername((data as any).user?.username || "");
      }
    });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await api.logout();
    setIsLoggedIn(false);
    setUsername("");
    setUserMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Interview", href: "/interview" },
    { label: "Reports", href: "/reports" },
  ];

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "12px 0" : "20px 0",
        background: scrolled ? "var(--bg)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--accent-text)", fontSize: 16, fontWeight: 800 }}>R</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Resume<span style={{ color: "var(--text-muted)" }}>Buddy</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s ease" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              {label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              href="/dashboard"
              style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s ease" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right section */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", fontSize: 16 }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--border)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {isLoggedIn ? (
            /* ── Logged-in: avatar + dropdown ── */
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(p => !p)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px 6px 6px",
                  borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--bg-secondary)", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                {/* Avatar */}
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--accent-text)" }}>
                  {username?.[0]?.toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{username}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: "6px", minWidth: 180,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  animation: "fade-in 0.15s ease",
                  zIndex: 200,
                }}>
                  <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--border)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      ⊞ Dashboard
                    </div>
                  </Link>
                  <Link href="/interview" onClick={() => setUserMenuOpen(false)} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--border)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      🎯 New Analysis
                    </div>
                  </Link>
                  <Link href="/reports" onClick={() => setUserMenuOpen(false)} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--border)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      📋 My Reports
                    </div>
                  </Link>
                  <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8,
                      fontSize: 13, fontWeight: 500, color: "#ef4444",
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8, textAlign: "left",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    {loggingOut ? "⏳ Signing out…" : "⎋ Sign Out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not logged in ── */
            <>
              <Link href="/signin" className="btn btn-ghost" style={{ padding: "8px 18px", fontSize: 14 }}>Sign In</Link>
              <Link href="/signup" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: 14 }}>Get Started</Link>
            </>
          )}
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {userMenuOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  );
}
