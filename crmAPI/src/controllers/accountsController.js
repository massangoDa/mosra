import { db } from '../db.js'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const loginAccount = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return res.error(401, "メールアドレスまたはパスワードが間違っています");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.error(401, "メールアドレスまたはパスワードが間違っています");
        }

        const payload = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.AUTH_TOKEN_SECRET_KEY, {
            expiresIn: "24h"
        });

        res.json({
            message: "ログイン成功",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
            token: token
        });
    } catch (error) {
        console.error("ユーザー取得時にエラー", error);
        res.error(500, error.message);
    }
}

const registerAccount = async (req, res) => {
    try {
        const {email, password, name} = req.body;

        const hashPassword = await bcrypt.hash(password, 10);

        const user = {
            email: email,
            password: hashPassword,
            name: name,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const result = await db.collection("users").insertOne(user);
        res.success(201);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.error(500, error.message);
    }
}

const logoutAccount = async (req, res) => {
    res.success(204);
}

export default {
    loginAccount,
    registerAccount,
    logoutAccount,
}