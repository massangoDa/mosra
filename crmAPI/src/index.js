import express from "express";
import cors from "cors";
import * as assert from "node:assert";
import {MongoClient, ObjectId} from "mongodb";
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

/*
 顧客関連
———————————————*/
// 顧客情報追加機能
app.post('/api/customers', authenticateToken, async (req, res) => {
    try {
        const { companyName, type, category, website, phone, description } = req.body;
        // ユーザーIDで紐づけ
        const userId = req.user.id;

        console.log(res)

        const customer = {
            userId: userId,
            companyName: companyName,
            type: type,
            category: category,
            website: website,
            phone: phone,
            description: description,
            createdAt: new Date(),
        };

        const result = await db.collection("customers").insertOne(customer);
        res.status(201).json({ success: true, customerId: result.insertedId });
    } catch (error) {
        console.log("エラーが発生:", error);
        res.status(500).json({ success: false, error: error.message });
    }
})
// 顧客情報受け渡し機能
app.get('/api/customers', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // ユーザーIDと紐づいているから
        const customers = await db.collection("customers").find({ userId }).sort({ createdAt: -1 }).toArray();

        res.json(customers);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// 一つの顧客に対する情報提供機能
app.get('/api/customers/:customerId', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;
        const customer = await db.collection("customers").findOne({
            userId: userId,
            _id: new ObjectId(customerId)
        });

        res.json(customer);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// 一つの顧客に対する削除機能
app.delete('/api/customers/:customerId', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const result = await db.collection("customers").deleteOne({
            _id: new ObjectId(customerId),
            userId: userId
        })
        res.json({ success: true, message: "顧客の削除に成功しました" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

/*
 取引関連
———————————————*/
// 一つの顧客に対する取引情報追加機能
app.post('/api/customers/:customerId/transactions', authenticateToken, async (req, res) => {
    try {
        // ボディーから受け取るものは後で決める
        const { product, amount, transactionStatus, invoiceId, cost } = req.body;
        // カスタマーIDで紐づけする
        const customerId = req.params.customerId;
        // ユーザーID紐づけをする
        const userId = req.user.id;

        const transaction = {
            userId: userId,
            customerId: new ObjectId(customerId),
            invoiceId: new ObjectId(invoiceId),
            product: product,
            amount: amount,
            cost: cost,
            createdAt: new Date(),
        }

        const result = await db.collection("transactions").insertOne(transaction);
        res.status(201).json({ success: true, customerId: result.insertedId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// 一つの顧客に対する取引情報提供機能(現在は不使用だが、一覧を表示するときに必要)
app.get('/api/customers/:customerId/transactions', authenticateToken, async (req, res) => {
    try {
        // ユーザーIDとカスタマーIDで紐づいている。この二つが対応しなかったら絶対に渡さない
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const transactions = await db.collection("transactions").find({
            userId: userId,
            customerId: new ObjectId(customerId)
        }).sort({ createdAt: -1 }).toArray();

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

/*
 請求書関連
———————————————*/
// 一つの顧客に対する請求書追加機能
app.post('/api/customers/:customerId/invoices', authenticateToken, async (req, res) => {
    try {
        const { invoiceNumber, totalAmount, invoiceRequest, invoiceStatus } = req.body;
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const invoices = {
            userId: userId,
            customerId: new ObjectId(customerId),
            invoiceNumber: invoiceNumber,
            totalAmount: totalAmount,
            invoiceRequest: invoiceRequest,
            invoiceStatus: invoiceStatus,
            createdAt: new Date(),
        }

        const result = await db.collection("invoices").insertOne(invoices);
        res.status(201).json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// 一つの顧客に対する請求書提供機能
app.get('/api/customers/:customerId/invoices', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const invoices = await db.collection("invoices").find({
            userId: userId,
            customerId: new ObjectId(customerId),
        }).sort({ createdAt: -1 }).toArray();

        res.json(invoices);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// 一つの顧客に対する一つの請求書情報提供機能
app.get('/api/customers/:customerId/invoices/:invoiceId', authenticateToken, async (req, res) => {
    const customerId = req.params.customerId;
    const userId = req.user.id;
    const invoiceId = req.params.invoiceId;

    const invoices = await db.collection("invoices").findOne({
        userId: userId,
        customerId: new ObjectId(customerId),
        _id: new ObjectId(invoiceId),
    });

    res.json(invoices);
})
// 一つの顧客に対する一つの請求書内の取引情報提供機能
app.get('/api/customers/:customerId/invoices/:invoiceId/transactions', authenticateToken, async (req, res) => {
    const customerId = req.params.customerId;
    const userId = req.user.id;
    const invoiceId = req.params.invoiceId;

    console.log(customerId, userId, invoiceId);

    const transactions = await db.collection("transactions").find({
        userId: userId,
        customerId: new ObjectId(customerId),
        invoiceId: new ObjectId(invoiceId),
    }).sort({ createdAt: -1 }).toArray();

    console.log("テスト:"+transactions);
    res.json(transactions);
})
// 一つの顧客に対する請求書修正機能
app.put('/api/customers/:customerId/invoices/:invoiceId', authenticateToken, async (req, res) => {
    try {
        const { invoiceNumber, totalAmount, invoiceRequest, invoiceStatus } = req.body;
        const customerId = req.params.customerId;
        const invoiceId = req.params.invoiceId;
        const userId = req.user.id;

        // まずはあるかの確認
        // まず請求書IDとユーザーIDと企業IDで検索
        const existingTransaction = await db.collection("invoices").findOne({
            _id: new ObjectId(invoiceId),
            userId: userId,
            customerId: new ObjectId(customerId),
        });

        if (!existingTransaction) {
            return res.status(404).json({ success: false, error: "取引が見つかりません" });
        }

        // 更新する内容
        const updateData = {
            $set: {
                updatedAt: new Date(),
            }
        };

        // 各フィールドが存在する場合のみ追加するようにすれば、何度もfetch回数が減るはず
        if (invoiceNumber !== undefined) updateData.$set.invoiceNumber = invoiceNumber;
        if (totalAmount !== undefined) updateData.$set.totalAmount = totalAmount;
        if (invoiceRequest !== undefined) updateData.$set.invoiceRequest = invoiceRequest;
        if (invoiceStatus !== undefined) updateData.$set.invoiceStatus = invoiceStatus;

        const result = await db.collection("invoices").updateOne({
                _id: new ObjectId(invoiceId),
                userId: userId,
                customerId: new ObjectId(customerId),
            },
            updateData
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, error: "更新対象が見つかりませんでした" });
        }

        res.json({ success: true, message: "取引情報が更新されました" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// 一つの顧客に対する請求書削除機能
app.delete('/api/customers/:customerId/invoices/:invoiceId', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const invoiceId = req.params.invoiceId;
        const userId = req.user.id;

        const result = await db.collection("invoices").deleteOne({
            _id: new ObjectId(invoiceId),
            userId: userId,
            customerId: new ObjectId(customerId),
        });
        res.json({ success: true, message: "請求書が削除されました" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

/*
 請求書内の取引関連
———————————————*/
// 一つの顧客に対する一つの請求書内の一つの取引情報修正機能
app.put('/api/customers/:customerId/invoices/:invoiceId/transactions/:transactionId', authenticateToken, async (req, res) => {
    try {
        const { product, amount, cost } = req.body;
        const customerId = req.params.customerId;
        const transactionId = req.params.transactionId;
        const invoiceId = req.params.invoiceId;
        const userId = req.user.id;

        // まずはあるかの確認
        // まず取引IDとユーザーIDと企業IDと請求書IDで検索
        const existingTransaction = await db.collection("transactions").findOne({
            _id: new ObjectId(transactionId),
            userId: userId,
            customerId: new ObjectId(customerId),
            invoiceId: new ObjectId(invoiceId),
        });

        if (!existingTransaction) {
            return res.status(404).json({ success: false, error: "取引が見つかりません" });
        }

        // 更新する内容
        const updateData = {
            $set: {
                product: product,
                amount: amount,
                cost: cost,
                updatedAt: new Date(),
            }
        };

        const result = await db.collection("transactions").updateOne({
                _id: new ObjectId(transactionId),
                userId: userId,
                customerId: new ObjectId(customerId),
                invoiceId: new ObjectId(invoiceId),
            },
            updateData
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, error: "更新対象が見つかりませんでした" });
        }

        res.json({ success: true, message: "取引情報が更新されました" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// 一つの顧客に対する一つの請求書内の一つの取引情報提供機能
app.get('/api/customers/:customerId/invoices/:invoiceId/transactions/:transactionId', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;
        const invoiceId = req.params.invoiceId;
        const _id = req.params.transactionId;

        const transaction = await db.collection("transactions").findOne({
            _id: new ObjectId(_id),
            userId: userId,
            customerId: new ObjectId(customerId),
            invoiceId: new ObjectId(invoiceId),
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// 一つの顧客に対する一つの請求書内の一つの取引履歴削除機能
app.delete('/api/customers/:customerId/invoices/:invoiceId/transactions/:transactionId', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;
        const invoiceId = req.params.invoiceId;
        const _id = req.params.transactionId;

        const result = await db.collection("transactions").deleteOne({
            _id: new ObjectId(_id),
            userId: userId,
            customerId: new ObjectId(customerId),
            invoiceId: new ObjectId(invoiceId),
        });
        res.json({ success: true, message: "取引情報が削除されました" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

// サーバー起動
app.listen(PORT, () => {
    console.log(`APIサーバーがhttp://localhost:${PORT}で起動しました`);
});
