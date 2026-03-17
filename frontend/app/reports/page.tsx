"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type ReportSummary } from "../lib/api";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";

const SEV_COLOR: Record<number, string> = {
  0: "#ef4444",
  1: "#f59e0b",
  2: "#22c55e",
};
function scoreColor(s: number) {
  return s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";
}
function scoreLabel(s: number) {
  return s >= 75 ? "Strong" : s >= 50 ? "Good" : "Weak";
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");

  const fetchReports = useCallback(async () => {
    const { data, error } = await api.getReports();
    if (error) {
      setToast({ message: error, type: "error" });
      setLoading(false);
      return;
    }
    if (data?.data) setReports(data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filtered = reports.filter((r) =>
    r.jobDescription.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin-slow 0.9s linear infinite" }} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your reports…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "96px 24px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
          <div>
            <div className="badge" style={{ marginBottom: 12 }}>📋 History</div>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              Your Analysis Reports
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>
              {reports.length} report{reports.length !== 1 ? "s" : ""} generated
            </p>
          </div>
          <Link href="/interview" className="btn btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>
            + New Analysis
          </Link>
        </div>

        {/* Search */}
        {reports.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <input
              className="input-field"
              placeholder="Search by job description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 420 }}
            />
          </div>
        )}

        {/* Empty state */}
        {reports.length === 0 && (
          <div className="glass-card" style={{ padding: "64px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No reports yet</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              Run your first resume analysis to get interview-ready in minutes.
            </p>
            <Link href="/interview" className="btn btn-primary">
              Start Analysis →
            </Link>
          </div>
        )}

        {/* Reports grid */}
        {filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((r, i) => (
              <Link
                key={r._id}
                href={`/reports/${r._id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="glass-card animate-fade-up"
                  style={{
                    padding: "24px 28px",
                    display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
                    cursor: "pointer",
                    animationDelay: `${i * 0.06}s`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(4px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                >
                  {/* Score pill */}
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
                    border: `3px solid ${scoreColor(r.matchScore)}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor(r.matchScore), letterSpacing: "-0.04em" }}>{r.matchScore}</span>
                    <span style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 600 }}>/ 100</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: `${scoreColor(r.matchScore)}22`, color: scoreColor(r.matchScore) }}>
                        {scoreLabel(r.matchScore)} Match
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(r.createdAt)}</span>
                    </div>
                    <p style={{
                      fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5,
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {r.jobDescription.slice(0, 160)}{r.jobDescription.length > 160 ? "…" : ""}
                    </p>
                  </div>
                  <div style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0 }}>›</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && reports.length > 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 14 }}>
            No reports match your search.
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
