"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? "12px 0" : "20px 0",
        background: scrolled
          ? "var(--bg)"
          : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            background: "var(--accent)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ color: "var(--accent-text)", fontSize: "16px", fontWeight: "800" }}>R</span>
          </div>
          <span style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>
            Resume<span style={{ color: "var(--text-muted)" }}>Buddy</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {["Features", "How it works", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--bg-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              fontSize: "16px",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--border)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--bg-secondary)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <Link href="/signin" className="btn btn-ghost" style={{ padding: "8px 18px", fontSize: "14px" }}>
            Sign In
          </Link>
          <Link href="/signup" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "14px" }}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
