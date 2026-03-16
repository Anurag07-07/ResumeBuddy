import jwt, {} from 'jsonwebtoken';
import { redisClient } from "../db/redisClient.js";
export const authMiddleware = async (req, res, next) => {
    try {
        const authtoken = req.cookies.token;
        if (!authtoken || !authtoken.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authtoken.split(" ")[1];
        // 1. Redis Blacklist Check
        const isBlacklisted = await redisClient.get(`bl_${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Token revoked. Please login again." });
        }
        // 2. Standard Verification
        const checkToken = jwt.verify(token, process.env.JWT_SECRET);
        if (checkToken) {
            req.userId = checkToken.id;
            next();
        }
        else {
            return res.status(403).json({ message: "Invalid User" });
        }
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired session" });
    }
};
//# sourceMappingURL=auth.js.map