import {db} from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import {ObjectId} from "mongodb";
import type * as types from "../types/types.js";

export const loginAccount = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;

        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return res.status(401).json("メールアドレスまたはパスワードが間違っています")
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json("メールアドレスまたはパスワードが間違っています")
        }

        const payload = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.AUTH_TOKEN_SECRET_KEY as string, {
            expiresIn: "24h"
        });

        // ログインしたOSを判断
        let operatingSystem;
        const userAgent = req.get('User-Agent');

        if (userAgent?.includes('Windows NT')) {
            operatingSystem = 'Windows';
        } else if (userAgent?.includes('Macintosh')) {
            operatingSystem = 'Mac';
        } else if (userAgent?.includes('Linux')) {
            operatingSystem = 'Linux';
        } else {
            operatingSystem = 'Unknown';
        }

        // ログイン履歴を保存
        const loginHistory: types.LoginHistory = {
            userId: user._id.toString(),
            loginTime: new Date(),
            ipAddress: req.ip,
            device: operatingSystem,
        }
        await db.collection("login-history").insertOne(loginHistory);

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
        res.status(500).json("エラーが発生しました");
    }
}

export const getUserInfo = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const user = await db.collection("users").findOne(
            {
                _id: new ObjectId(userId)
            }
        );

        if (!user) {
            res.status(404).json("ユーザーが見つかりません");
        }

        res.json(user);
    } catch (error) {
        console.log("ユーザー情報取得でエラー:", error);
        res.status(500).json("エラーが発生しました")
    }
}

export const registerAccount = async (req: Request, res: Response) => {
    try {
        const {email, password, name} = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        await db.collection<types.User>("users").insertOne(
            {
                email: email,
                password: hashPassword,
                name: name,
                icon: '/uploads/icons/default.png',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        );

        res.status(201);
    } catch (error) {
        console.error("ユーザー登録時にエラー", error);
        res.status(500).json("エラーが発生しました");
    }
}

export const logoutAccount = async (_req: Request, res: Response) => {
    res.status(204);
}