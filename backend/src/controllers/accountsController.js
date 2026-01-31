import { db } from '../db.js'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ObjectId} from "mongodb";
import * as path from "node:path";
import * as fs from "node:fs";
import {fileURLToPath} from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// multer設定
const storage = multer.diskStorage({
    destination(req, file, cb) {
        const dir = path.join(__dirname, "..", "uploads", "icons");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename(req, file, cb) {
        cb(null, `${req.body.id}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });


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

        // ログインしたOSを判断
        let operatingSystem;
        const userAgent = req.get('User-Agent');

        if (userAgent.includes('Windows NT')) {
            operatingSystem = 'Windows';
        } else if (userAgent.includes('Macintosh')) {
            operatingSystem = 'Mac';
        } else if (userAgent.includes('Linux')) {
            operatingSystem = 'Linux';
        } else {
            operatingSystem = 'Unknown';
        }

        // ログイン履歴を保存
        const loginHistory = {
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
            icon: '/uploads/icons/default.png',
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

const updateAccount = async (req, res) => {
    try {
        const { id, email, password, name } = req.body;
        const existingUser = await db.collection("users").findOne({ _id: new ObjectId(id) });

        if (!existingUser) {
            return res.status(404).json({success: false, error: 'ユーザーが見つかりませんでした'});
        }

        // 更新する内容
        const updateData = {
            email: email,
            name: name,
        }
        // パスワードは存在していたらアップデートする
        if (password) {
            updateData.password = password;
        }

        const result = await db.collection("users").updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: updateData
            }
        )

        res.success(200);
    } catch (error) {
        console.error("ユーザーアップデートエラー", error);
        res.error(500, error.message);
    }
}

const getLoginHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.collection("login-history").find({
            userId: userId
        }).sort({ loginTime: -1 }).toArray();

        res.json(result);
    } catch (error) {
        console.log("ログイン履歴取得でエラー", error);
        res.error(500, error.message);
    }
}

const updateIcon = async (req, res) => {
    try {
        const { id } = req.body;
        const existingUser = await db.collection("users").findOne({ _id: new ObjectId(id) });

        if (!existingUser) {
            return res.status(404).json({success: false, error: 'ユーザーが見つかりませんでした'});
        }

        // アイコンデータを/uploads/icons/xx.png で保存
        const filePath = `/uploads/icons/${req.file.filename}`;

        await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            { $set: { icon: filePath } }
        );

        res.success(200);
    } catch (error) {
        console.log("アイコン更新でエラー発生", error);
        res.error(500, error.message);
    }
}

export default {
    loginAccount,
    registerAccount,
    logoutAccount,
    updateAccount,
    getLoginHistory,
    updateIcon,
}