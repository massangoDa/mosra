import express from "express";
import cors from "cors";
import * as assert from "node:assert";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const url = "mongodb://162.43.33.158:27017/crm?directConnection=true&serverSelectionTimeoutMS=5000&appName=mongosh+2.3.0";
const SECRET_KEY = "MOSSANGOOES";
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

//MongoDB接続
let db;

async function connectToMongo() {
    try {
        const client = await MongoClient.connect(url);
        console.log("Connected successfully to server");
        db = client.db("crm");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}
connectToMongo();

// ルート設定
app.get("/", async (req, res) => {
    res.send("APIサーバーが起動しました！");
});

// login機能
app.post("/api/login", async (req, res) => {
    try {
        // メールとパスワードをreq.bodyから
        const {email, password} = req.body;
        // emailだけでUsersの中身から検索
        const user = await db.collection("users").findOne({email});

        const payload = {
            id: user._id,
            name: user.name,
            email: user.email
        };
        const token = jwt.sign(payload, SECRET_KEY, {
            expiresIn: "1h"
        });

        res.json({
            message: "ユーザーが見つかった",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
            token: token
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
});

// logout機能
app.post("/api/logout", async (req, res) => {
    res.json({ message: 'ログアウトしました(tokenあれば入れる)' });
});

// token認証
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "認証が必要"
        });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "トークンが無効"
            });
        }
        req.user = user;
        next();
    })
}

// dashboard
app.get("/api/dashboard", authenticateToken, (req, res) => {
    try {
        res.json({
            message: "ダッシュボードにアクセスした",
            user: req.user
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({
            message: "サーバーエラー",
            error: err.message
        });
    }
})

// 顧客情報追加機能
app.post('/api/customer', authenticateToken, async (req, res) => {
    try {
        const { name, type, category, website, phone, description, address, } = req.body;
        // ユーザーIDで紐づけ
        const userId = req.user.id;

        const customer = {
            userId: userId,
            CompanyName: name,
            type: type,
            category: category,
            website: website,
            phone: phone,
            description: description,
            address: {
                postalCode: address.postalCode,
                prefecture: address.prefecture,
                detail: address.detail,
            },
            createdAt: new Date(),
        };

        const result = await db.collection("customers").insertOne(customer);
        res.status(201).json({ success: true, customerId: result.insertedId });
    } catch (error) {
        console.log("エラーが発生:", error);
        res.status(500).json({ success: false, error: error.message });
    }
})


// サーバー起動
app.listen(PORT, () => {
    console.log(`APIサーバーがhttp://localhost:${PORT}で起動しました`);
});
