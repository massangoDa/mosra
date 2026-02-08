import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type {AuthUser} from "../types/auth.type.js";
import {ObjectId} from "mongodb";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "認証が必要"
        });
    }

    jwt.verify(token, process.env.AUTH_TOKEN_SECRET_KEY as string, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                message: "トークンが無効"
            });
        }

        const payload = decoded as any;
        req.user = {
            ...payload,
            id: new ObjectId(payload.id)
        };
        next();
    });
};