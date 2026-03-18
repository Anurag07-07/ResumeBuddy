"use client";
import { useEffect, useState } from "react";
import type { TailoredResume } from "../lib/api";

export default function ResumePreviewPage() {
  const [resume, setResume] = useState<TailoredResume | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("tailored_resume");
    if (!raw) { setError(true); return; }
    try { setResume(JSON.parse(raw)); }
    catch { setError(true); }
  }, []);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", background: "#f1f5f9" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>Resume data not found</h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>Please go back and generate the resume again.</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <div style={{ fontSize: 14, color: "#64748b", fontFamily: "Georgia, serif" }}>Loading resume…</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #e8e8e8;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* ── Action toolbar ── */
        .action-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          background: #1e293b;
          padding: 10px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.35);
          font-family: 'Inter', sans-serif;
        }
        .action-bar-left {
          display: flex; align-items: center; gap: 10px;
        }
        .brand-logo {
          width: 30px; height: 30px; border-radius: 7px;
          background: #6366f1;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 800; color: white;
        }
        .brand-name { font-size: 13px; font-weight: 700; color: white; }
        .brand-sub  { font-size: 11px; color: #94a3b8; margin-top: 1px; }

        .action-bar-right { display: flex; align-items: center; gap: 12px; }
        .hint-text { font-size: 11px; color: #64748b; }
        .print-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 18px;
          background: #6366f1;
          color: white;
          border: none; border-radius: 8px;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .print-btn:hover { background: #4f46e5; transform: translateY(-1px); }
        .print-btn:active { transform: translateY(0); }

        /* ── Page wrapper ── */
        .page-wrap {
          min-height: 100vh;
          padding: 72px 24px 60px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        /* ── Resume paper ── */
        .resume {
          width: 794px; /* A4 width at 96dpi */
          min-height: 1123px; /* A4 height at 96dpi */
          background: #ffffff;
          box-shadow: 0 8px 48px rgba(0,0,0,0.18);
          padding: 52px 56px 60px;
          font-family: 'EB Garamond', Georgia, serif;
          color: #1a1a1a;
          font-size: 11.5pt;
          line-height: 1.45;
          position: relative;
        }

        /* ── Name & title ── */
        .resume-name {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 32pt;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #111111;
          line-height: 1;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .resume-job-title {
          font-family: 'Inter', sans-serif;
          font-size: 11pt;
          font-weight: 600;
          color: #444;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .resume-contact {
          font-family: 'Inter', sans-serif;
          font-size: 9pt;
          color: #555;
          display: flex;
          flex-wrap: wrap;
          gap: 0 6px;
          margin-bottom: 2px;
        }
        .resume-contact span::after {
          content: ' |';
          margin-left: 6px;
          color: #bbb;
        }
        .resume-contact span:last-child::after { content: ''; }

        /* ── Section heading ── */
        .section { margin-bottom: 18px; }
        .section-title {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 11pt;
          font-weight: 600;
          font-style: italic;
          color: #222;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 8px;
          background: #e5e5e5;
          margin-bottom: 10px;
          margin-top: 18px;
        }

        /* ── Summary ── */
        .summary-text {
          font-size: 11pt;
          color: #333;
          line-height: 1.6;
        }

        /* ── Technical skills grid ── */
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px 16px;
        }
        .skill-item {
          font-family: 'Inter', sans-serif;
          font-size: 9.5pt;
          color: #333;
          padding: 1px 0;
        }

        /* ── Experience ── */
        .exp-item { margin-bottom: 14px; }
        .exp-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }
        .exp-role {
          font-size: 11pt;
          font-weight: 700;
          color: #111;
        }
        .exp-company-row {
          font-size: 10pt;
          color: #333;
          margin-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }
        .exp-company { font-style: italic; }
        .exp-duration {
          font-family: 'Inter', sans-serif;
          font-size: 9pt;
          color: #666;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .exp-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .exp-bullets li {
          font-size: 10.5pt;
          color: #333;
          line-height: 1.55;
          padding-left: 14px;
          position: relative;
          margin-bottom: 3px;
        }
        .exp-bullets li::before {
          content: '•';
          position: absolute;
          left: 2px;
          font-size: 11pt;
          color: #555;
          top: -1px;
        }

        /* ── Projects / Education ── */
        .proj-item { margin-bottom: 14px; }
        .proj-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 2px;
        }
        .proj-name { font-size: 11pt; font-weight: 700; color: #111; }
        .proj-org  { font-size: 10pt; font-style: italic; color: #444; }
        .proj-year {
          font-family: 'Inter', sans-serif;
          font-size: 9pt;
          color: #666;
          white-space: nowrap;
        }
        .proj-tech {
          font-family: 'Inter', sans-serif;
          font-size: 9pt;
          color: #555;
          margin-bottom: 3px;
        }
        .proj-desc { font-size: 10.5pt; color: #333; line-height: 1.55; }

        .edu-item { margin-bottom: 12px; }
        .edu-degree { font-size: 11pt; font-weight: 700; color: #111; }
        .edu-school-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }
        .edu-school { font-size: 10.5pt; font-style: italic; color: #333; }
        .edu-year {
          font-family: 'Inter', sans-serif;
          font-size: 9pt;
          color: #666;
          white-space: nowrap;
        }

        /* ── Additional info / certs ── */
        .cert-list {
          list-style: none;
        }
        .cert-list li {
          font-size: 10.5pt;
          color: #333;
          line-height: 1.55;
          padding-left: 14px;
          position: relative;
          margin-bottom: 3px;
        }
        .cert-list li::before {
          content: '•';
          position: absolute;
          left: 2px;
          font-size: 11pt;
          color: #555;
          top: -1px;
        }

        /* ── Print ── */
        @media print {
          .action-bar { display: none !important; }
          .page-wrap {
            padding: 0 !important;
            background: white !important;
            min-height: unset;
          }
          body { background: white !important; }
          .resume {
            box-shadow: none !important;
            width: 100% !important;
            min-height: unset !important;
            padding: 14mm 16mm !important;
          }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-bar-left">
          <div className="brand-logo">R</div>
          <div>
            <div className="brand-name">ResumeBuddy</div>
            <div className="brand-sub">Tailored for: {resume.title}</div>
          </div>
        </div>
        <div className="action-bar-right">
          <span className="hint-text">Ctrl+P → Save as PDF</span>
          <button className="print-btn" onClick={() => window.print()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Resume Paper */}
      <div className="page-wrap">
        <div className="resume">

          {/* ── Header ── */}
          <div className="resume-name">{resume.name || "Your Name"}</div>
          <div className="resume-job-title">{resume.title || "Software Engineer"}</div>
          <div className="resume-contact">
            {resume.email    && <span>{resume.email}</span>}
            {resume.phone    && <span>{resume.phone}</span>}
            {resume.location && <span>{resume.location}</span>}
            {resume.linkedin && <span>{resume.linkedin}</span>}
          </div>

          {/* ── Education (shown first per classic resume format) ── */}
          {resume.education?.length > 0 && (
            <div className="section">
              <div className="section-title">Education</div>
              {resume.education.map((edu, i) => (
                <div key={i} className="edu-item">
                  <div className="edu-degree">{edu.degree}</div>
                  <div className="edu-school-row">
                    <span className="edu-school">{edu.institution}</span>
                    {edu.year && <span className="edu-year">{edu.year}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Summary ── */}
          {resume.summary && (
            <div className="section">
              <div className="section-title">Professional Summary</div>
              <p className="summary-text">{resume.summary}</p>
            </div>
          )}

          {/* ── Technical Skills ── */}
          {resume.skills?.length > 0 && (
            <div className="section">
              <div className="section-title">Technical Skills</div>
              <div className="skills-grid">
                {resume.skills.map((s, i) => (
                  <div key={i} className="skill-item">{s}</div>
                ))}
              </div>
            </div>
          )}

          {/* ── Professional Experience ── */}
          {resume.experience?.length > 0 && (
            <div className="section">
              <div className="section-title">Professional Experience</div>
              {resume.experience.map((exp, i) => (
                <div key={i} className="exp-item">
                  <div className="exp-header">
                    <span className="exp-role">{exp.role}</span>
                  </div>
                  <div className="exp-company-row">
                    <span className="exp-company">{exp.company}</span>
                    {exp.duration && <span className="exp-duration">{exp.duration}</span>}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="exp-bullets">
                      {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Projects ── */}
          {resume.projects?.length > 0 && (
            <div className="section">
              <div className="section-title">Projects</div>
              {resume.projects.map((p, i) => (
                <div key={i} className="proj-item">
                  <div className="proj-header">
                    <span className="proj-name">{p.name}</span>
                  </div>
                  {p.tech && <div className="proj-tech">{p.tech}</div>}
                  {p.description && <div className="proj-desc">{p.description}</div>}
                </div>
              ))}
            </div>
          )}

          {/* ── Certifications ── */}
          {resume.certifications?.length > 0 && (
            <div className="section">
              <div className="section-title">Additional Information</div>
              <ul className="cert-list">
                {resume.certifications.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
