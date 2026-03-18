import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { dbConnect } from "./db/db.js";
dotenv.config();

const app = express();

app.use(express.json());
const allowedOrigins = [
  "https://resume-buddy-zknd.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://resume-buddy-zknd-cfxtv3lmy-anurag07-07s-projects.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(cookieParser());

import userauth from "./routes/auth.route.js";
import interviewRoute from './routes/interview.route.js'
import { connectRedis } from "./db/redisClient.js";

app.use("/api/v1", userauth);
app.use("/api/v1", interviewRoute);

const PORT = process.env.PORT || 3000;

const serverStart = async () => {
  try {
    await dbConnect();

    await connectRedis();
    app.listen(PORT, () => {
      console.log(`Server Started at PORT ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

serverStart();
