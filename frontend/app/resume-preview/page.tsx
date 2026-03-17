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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: "#f9fafb" }}>
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <div style={{ fontSize: 14, color: "#64748b" }}>Loading resume…</div>
      </div>
    );
  }

  return (
    <>
      {/* Print-only styles injected via a real style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: #f1f5f9;
          color: #0f172a;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Action bar — hidden when printing */
        .action-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: #0f172a;
          padding: 12px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }

        .print-btn {
          padding: 9px 22px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .print-btn:hover { background: #4338ca; }

        .page-wrap {
          min-height: 100vh;
          padding: 80px 24px 48px;
          display: flex;
          justify-content: center;
        }

        /* ── Resume card ── */
        .resume {
          width: 100%;
          max-width: 860px;
          background: white;
          box-shadow: 0 4px 40px rgba(0,0,0,0.12);
          border-radius: 4px;
          overflow: hidden;
        }

        /* ── Header ── */
        .resume-header {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%);
          padding: 40px 48px 32px;
          color: white;
        }
        .resume-name {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .resume-title {
          font-size: 15px;
          font-weight: 500;
          color: #a5b4fc;
          margin-bottom: 18px;
          letter-spacing: 0.01em;
        }
        .contact-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 12px;
          color: #c7d2fe;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* ── Body ── */
        .resume-body {
          display: grid;
          grid-template-columns: 1fr 280px;
        }

        /* Left column */
        .resume-main {
          padding: 36px 40px;
          border-right: 1px solid #e2e8f0;
        }

        /* Right column */
        .resume-side {
          padding: 36px 32px;
          background: #f8fafc;
        }

        /* Section */
        .section { margin-bottom: 28px; }
        .section-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #4f46e5;
          border-bottom: 2px solid #e0e7ff;
          padding-bottom: 6px;
          margin-bottom: 16px;
        }

        /* Summary */
        .summary-text {
          font-size: 13px;
          color: #374151;
          line-height: 1.75;
        }

        /* Experience */
        .exp-item { margin-bottom: 20px; }
        .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; flex-wrap: wrap; gap: 4px; }
        .exp-role { font-size: 14px; font-weight: 700; color: #0f172a; }
        .exp-duration { font-size: 11px; color: #94a3b8; white-space: nowrap; }
        .exp-company { font-size: 12px; color: #4f46e5; font-weight: 500; margin-bottom: 8px; }
        .exp-bullets { list-style: none; }
        .exp-bullets li {
          font-size: 12.5px;
          color: #374151;
          line-height: 1.65;
          padding-left: 14px;
          position: relative;
          margin-bottom: 4px;
        }
        .exp-bullets li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #4f46e5;
          font-size: 10px;
          top: 2px;
        }

        /* Projects */
        .project-item { margin-bottom: 16px; }
        .project-name { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
        .project-tech { font-size: 11px; color: #4f46e5; font-weight: 600; margin-bottom: 4px; }
        .project-desc { font-size: 12px; color: #374151; line-height: 1.6; }

        /* Side column */
        .skill-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag {
          font-size: 11px;
          font-weight: 500;
          padding: 4px 10px;
          background: #e0e7ff;
          color: #3730a3;
          border-radius: 100px;
        }

        .edu-item { margin-bottom: 14px; }
        .edu-degree { font-size: 13px; font-weight: 600; color: #0f172a; }
        .edu-school { font-size: 12px; color: #4f46e5; font-weight: 500; margin-top: 2px; }
        .edu-year { font-size: 11px; color: #94a3b8; margin-top: 2px; }

        .cert-item {
          font-size: 12px;
          color: #374151;
          padding: 6px 0;
          border-bottom: 1px solid #f1f5f9;
          line-height: 1.5;
        }

        /* ── Print overrides ── */
        @media print {
          .action-bar { display: none !important; }
          .page-wrap { padding: 0; background: white; }
          .resume { box-shadow: none; border-radius: 0; max-width: 100%; }
          body { background: white; }
          @page { margin: 0mm; size: A4; }
        }
      `}</style>

      {/* Action bar */}
      <div className="action-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 14, fontWeight: 800 }}>R</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>ResumeBuddy</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Tailored for: {resume.title}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Press Ctrl+P → Save as PDF</span>
          <button className="print-btn" onClick={() => window.print()}>
            ⬇ Download PDF
          </button>
        </div>
      </div>

      <div className="page-wrap">
        <div className="resume">

          {/* Header */}
          <div className="resume-header">
            <div className="resume-name">{resume.name || "Your Name"}</div>
            <div className="resume-title">{resume.title || "Software Engineer"}</div>
            <div className="contact-row">
              {resume.email && <span className="contact-item">✉ {resume.email}</span>}
              {resume.phone && <span className="contact-item">📞 {resume.phone}</span>}
              {resume.location && <span className="contact-item">📍 {resume.location}</span>}
              {resume.linkedin && <span className="contact-item">🔗 {resume.linkedin}</span>}
            </div>
          </div>

          <div className="resume-body">
            {/* ── Left main column ── */}
            <div className="resume-main">

              {/* Summary */}
              {resume.summary && (
                <div className="section">
                  <div className="section-title">Professional Summary</div>
                  <p className="summary-text">{resume.summary}</p>
                </div>
              )}

              {/* Experience */}
              {resume.experience?.length > 0 && (
                <div className="section">
                  <div className="section-title">Experience</div>
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="exp-item">
                      <div className="exp-header">
                        <span className="exp-role">{exp.role}</span>
                        <span className="exp-duration">{exp.duration}</span>
                      </div>
                      <div className="exp-company">{exp.company}</div>
                      <ul className="exp-bullets">
                        {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resume.projects?.length > 0 && (
                <div className="section">
                  <div className="section-title">Projects</div>
                  {resume.projects.map((p, i) => (
                    <div key={i} className="project-item">
                      <div className="project-name">{p.name}</div>
                      <div className="project-tech">{p.tech}</div>
                      <div className="project-desc">{p.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right side column ── */}
            <div className="resume-side">

              {/* Skills */}
              {resume.skills?.length > 0 && (
                <div className="section">
                  <div className="section-title">Skills</div>
                  <div className="skill-list">
                    {resume.skills.map((s, i) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resume.education?.length > 0 && (
                <div className="section">
                  <div className="section-title">Education</div>
                  {resume.education.map((edu, i) => (
                    <div key={i} className="edu-item">
                      <div className="edu-degree">{edu.degree}</div>
                      <div className="edu-school">{edu.institution}</div>
                      <div className="edu-year">{edu.year}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {resume.certifications?.length > 0 && (
                <div className="section">
                  <div className="section-title">Certifications</div>
                  {resume.certifications.map((c, i) => (
                    <div key={i} className="cert-item">{c}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
