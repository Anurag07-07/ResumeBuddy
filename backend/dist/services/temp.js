const resume = `
Anurag Sharma
Noida, India
anurag.dev@email.com
+91 9876543210
GitHub: github.com/anurag-dev
LinkedIn: linkedin.com/in/anurag-dev

PROFESSIONAL SUMMARY
Full-Stack Developer with expertise in the MERN stack and Go. 
Passionate about building scalable backend architectures and AI-integrated tools.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript, Go
- Frontend: React, Next.js, Tailwind CSS
- Backend: Node.js, Express.js, Prisma, PostgreSQL
- Database: MongoDB, Mongoose, Redis
- Tools: Docker, Git, JWT Authentication

WORK EXPERIENCE
Backend Developer Intern | Tech-Startup
- Implemented JWT-based authentication and optimized MongoDB queries.
- Built a real-time streaming feature using LiveKit.
`;
const selfDescription = `
I am a MERN stack developer focused on building scalable systems. 
I have a strong foundation in DSA and competitive programming. 
Recently, I've been building "Geni" (ResumeBuddy) using Gemini AI and Redis. 
I am looking to improve my expertise in distributed systems and performance optimization.
`;
const jobDescription = `
Position: Backend Developer (Node.js)
Location: Remote / Bangalore

We are looking for a Backend Developer with strong experience in Node.js 
and database design to build scalable and high-performance APIs.

Responsibilities:
- Design and develop scalable RESTful APIs using Node.js and Express.
- Optimize database performance using indexing and caching strategies.
- Implement authentication and authorization mechanisms.
- Work with Redis or similar caching solutions.

Required Skills:
- 3+ years experience in backend development.
- Strong knowledge of Node.js and asynchronous programming.
- Experience with MongoDB and database optimization.
- Understanding of caching strategies (Redis preferred).
`;
// Example of how you would call your Gemini service later:
/*
const analysis = await geminiService.analyze(resume, jobDescription, selfDescription);
console.log(analysis);
*/
export { resume, selfDescription, jobDescription };
//# sourceMappingURL=temp.js.map