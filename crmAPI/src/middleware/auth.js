import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "認証が必要"
        });
    }

    jwt.verify(token, process.env.AUTH_TOKEN_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "トークンが無効"
            });
        }
        req.user = user;
        next();
    });
};