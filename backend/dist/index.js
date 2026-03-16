import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { dbConnect } from "./db/db.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
}));
app.use(cookieParser());
import userauth from "./routes/auth.route.js";
import { connectRedis } from "./db/redisClient.js";
app.use("/api/v1", userauth);
const PORT = process.env.PORT || 3000;
const serverStart = async () => {
    try {
        await dbConnect();
        await connectRedis();
        app.listen(PORT, () => {
            console.log(`Server Started at PORT ${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};
serverStart();
//# sourceMappingURL=index.js.map