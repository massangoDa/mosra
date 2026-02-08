import {db} from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import {ObjectId} from "mongodb";
import type * as types from "../types/types.js";
import path = require("node:path");
import * as fs from "node:fs";
import multer from "multer";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// multer設定
const storage = multer.diskStorage({
    destination(req: Request, file, cb) {
        const dir = path.join(__dirname, "..", "uploads", "icons");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename(req: Request, file, cb) {
        cb(null, `${req.user.id}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

export const loginAccount = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;

        const user = await db.collection("users").findOne(
            {
                email
            }
        );

        if (!user) {
            return res.status(401).json("メールアドレスまたはパスワードが間違っています")
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json("メールアドレスまたはパスワードが間違っています")
        }

        const payload = {
            id: user._id.toString(),
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
            userId: new ObjectId(user._id),
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
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await db.collection<types.User>("users").insertOne(
            {
                email: email,
                password: hashedPassword,
                name: name,
                icon: '/uploads/icons/default.png',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        );

        if (!result.insertedId) {
            return res.status(400).json("ユーザー登録に失敗しました");
        }

        res.status(201).json("ユーザーを作成しました");
    } catch (error) {
        console.error("ユーザー登録時にエラー", error);
        res.status(500).json("エラーが発生しました");
    }
}

export const logoutAccount = async (_req: Request, res: Response) => {
    res.status(204);
}

export const updateAccount = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        const userId = req.user.id;
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await db.collection<types.User>("users").findOneAndUpdate(
            {
                _id: new ObjectId(userId),
            },
            {
                $set: {
                    email: email,
                    name: name,
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        )

        if (!result) {
            return res.status(404).json("ユーザーが見つかりません");
        }

        res.status(200).json("ユーザー情報を更新しました");
    } catch (error) {
        console.error("ユーザーアップデートエラー", error);
        res.status(500).json("エラーが発生しました");
    }
}

export const updateIcon = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        if (!req.file) {
            return res.status(400).json("ファイルが必要です");
        }

        // アイコンデータを/uploads/icons/xx.png で保存
        const filePath = `/uploads/icons/${req.file.filename}`;

        const result = await db.collection<types.User>("users").findOneAndUpdate(
            {
                _id: new ObjectId(id)
            },
            {
                $set: {
                    icon: filePath
                }
            }
        )

        if (!result) {
            return res.status(404).json("ユーザーが見つかりません");
        }

        res.status(200).json("アイコンを更新しました");
    } catch (error) {
        console.log("アイコン更新でエラー発生", error);
        res.status(500).json("エラーが発生しました");
    }
}

export const getLoginHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const result = await db.collection("login-history").find({
            userId: new ObjectId(userId)
        }).sort({ loginTime: -1 }).toArray();

        res.json(result);
    } catch (error) {
        console.log("ログイン履歴取得でエラー", error);
        res.status(500).json("エラーが発生しました");
    }
}