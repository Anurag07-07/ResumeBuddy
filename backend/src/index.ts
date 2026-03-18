import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { dbConnect } from "./db/db.js";
dotenv.config();

const app = express();

app.use(express.json());


app.set("trust proxy", 1);
const allowedOrigins = [
  "https://resume-buddy-pi.vercel.app",
  "http://localhost:3000",
  "https://resume-buddy-git-main-anurag07-07s-projects.vercel.app",
  "https://resume-buddy-djgdydw9u-anurag07-07s-projects.vercel.app", // 👈 add this
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
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
