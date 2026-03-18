import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { redisClient } from "../db/redisClient.js";



export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Redis blacklist check
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token revoked. Please login again." });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    req.userId = decoded.id;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};