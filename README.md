
# 📄 ResumeBuddy (Geni)

> An AI-powered resume analyzer, tailored resume generator, and interview preparation assistant built with Next.js, Node.js, and Gemini AI.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-API-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

---

## 🎬 Project Walkthrough & Demo

Watch a full walkthrough of the application features, resume parsing, interactive report dashboard, and AI PDF generation in action:

[![ResumeBuddy Demo Video](https://img.youtube.com/vi/rI6CNtJc330/maxresdefault.jpg)](https://www.youtube.com/watch?v=rI6CNtJc330)

> 💡 **[Click here to watch the full demo on YouTube](https://www.youtube.com/watch?v=rI6CNtJc330)**

---

## ✨ Features

- 📊 **Comprehensive Analytics Dashboard**: Tracks your historical analysis attempts, score progression, average scores, and best performance metrics over time.
- 🎯 **Tailored AI Resume Analysis**: Upload your PDF resume along with a target job description to get a detailed breakdown of your fit for the role.
- 🧠 **Technical & Behavioral Question Generation**: Produces role-specific interview questions, explaining *why* the interviewer asks each question alongside ideal model answers.
- 📉 **Skill Gap Identification**: Highlighting missing skills, experience gaps, and critical areas requiring immediate attention prioritized by urgency.
- 🗓️ **7-Day Actionable Study Plan**: Automatically organizes your preparation into high, medium, and low-priority tasks to maximize interview readiness.
- 📄 **Tailored Resume PDF Generation**: Generates a targeted version of your resume aligned directly with the job description—ready to edit and download.
- 🌙 **Dark / Light Mode**: Full theme customization across desktop and tablet views.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express, Next.js API Routes
- **Database & Cache**: PostgreSQL / MongoDB, Redis (Token blacklisting & caching)
- **AI Processing**: Google Gemini API, PDF Parsing utilities

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have installed:
- **Node.js**: `v18.x` or higher
- **npm** / **pnpm** / **yarn**
- **Redis Server** (Local or Cloud instance)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone [https://github.com/Anurag07-07/ResumeBuddy.git](https://github.com/Anurag07-07/ResumeBuddy.git)
cd ResumeBuddy
npm install

3. Environment Variables
Create a .env.local file in the root directory and add your key variables:
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Redis Cache
REDIS_URL=redis://localhost:6379

# Database URL
DATABASE_URL=your_database_connection_string

4. Run Development Server
npm run dev

Open http://localhost:3000 with your browser to launch the application.
📸 Core Workflow
 * Sign In: Access your personal analytics and historical reports.
 * Upload & Analyze: Provide a targeted Job Description, add optional candidate notes, and upload your PDF resume.
 * Review Detailed Insights: Explore skill gap analysis, technical & behavioral Q&A sets, and a structured 7-day preparation roadmap.
 * Export Resume: Generate and download an optimized, role-specific PDF resume.
🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check out the issues page.
📄 License
Distributed under the MIT License. See LICENSE for more information.
http://googleusercontent.com/youtube_content/1 *YouTube video views will be stored in your YouTube History, and your data will be stored and used by YouTube according to its [Terms of Service](https://www.youtube.com/static?template=terms)*


