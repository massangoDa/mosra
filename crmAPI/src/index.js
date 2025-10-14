import express from "express";
import cors from "cors";
import {MongoClient, ObjectId} from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as path from "node:path";
import { fileURLToPath } from 'url';
import {authenticate} from "@google-cloud/local-auth";
import {google} from "googleapis";
import * as fs from "node:fs";
import { convert } from 'html-to-text';

const url = "mongodb://162.43.33.158:27017/crm?directConnection=true&serverSelectionTimeoutMS=5000&appName=mongosh+2.3.0";
const SECRET_KEY = "MOSSANGOOES";
const app = express();
const PORT = 5000;

// Gmail権限
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

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
await connectToMongo();

// ルート設定
app.get("/", async (req, res) => {
    await gmailMain();
});

// login機能
app.post("/api/login", async (req, res) => {
    try {
        // メールとパスワードをreq.bodyから
        const {email, password} = req.body;

        // 検索
        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "メールアドレスまたはパスワードが間違っています" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "メールアドレスまたはパスワードが間違っています" });
        }

        const payload = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        const token = jwt.sign(payload, SECRET_KEY, {
            expiresIn: "1h"
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
        console.error("Error fetching user:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
});

// アカウント作成機能
app.post("/api/register", async (req, res) => {
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
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
})

// logout機能
app.post("/api/logout", async (req, res) => {
    res.json({ message: 'ログアウトしました(tokenあれば入れる)' });
});

// Verify
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
    });
};

// カレンダーイベント操作(追加・更新対応)
const manageCalendarEvent = async (eventData, eventId = null) => {
    try {
        // 更新の場合
        if (eventId) {
            const updateFields = {};

            // 渡されたフィールドだけを更新対象に追加
            if (eventData.userId !== undefined) updateFields.userId = eventData.userId;
            if (eventData.title !== undefined) updateFields.title = eventData.title;
            if (eventData.description !== undefined) updateFields.description = eventData.description;
            if (eventData.date !== undefined) updateFields.date = new Date(eventData.date);
            if (eventData.startTime !== undefined) updateFields.startTime = new Date(eventData.startTime);
            if (eventData.endTime !== undefined) updateFields.endTime = new Date(eventData.endTime);
            if (eventData.allDay !== undefined) updateFields.allDay = eventData.allDay;
            if (eventData.category !== undefined) updateFields.category = eventData.category;
            if (eventData.color !== undefined) updateFields.color = eventData.color;
            if (eventData.relatedInvoice !== undefined) updateFields.relatedInvoice = eventData.relatedInvoice;
            if (eventData.relatedCustomer !== undefined) updateFields.relatedCustomer = eventData.relatedCustomer;
            if (eventData.status !== undefined) updateFields.status = eventData.status;
            if (eventData.location !== undefined) updateFields.location = eventData.location;

            updateFields.updatedAt = new Date();

            const result = await db.collection("calendar-events").updateOne(
                { _id: new ObjectId(eventId) },
                { $set: updateFields }
            );
            return { success: true, updated: true, modifiedCount: result.modifiedCount };
        }

        // 新規追加の場合(デフォルト値を設定)
        const calendarEvent = {
            userId: eventData.userId,
            title: eventData.title,
            description: eventData.description || '',
            date: new Date(eventData.date),
            startTime: new Date(eventData.startTime),
            endTime: eventData.endTime ? new Date(eventData.endTime) : new Date(eventData.startTime),
            allDay: eventData.allDay !== undefined ? eventData.allDay : false,
            category: eventData.category || 'other',
            color: eventData.color || '#3b82f6',
            relatedInvoice: eventData.relatedInvoice || null,
            relatedCustomer: eventData.relatedCustomer || null,
            status: eventData.status || 'pending',
            location: eventData.location || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("calendar-events").insertOne(calendarEvent);
        return { success: true, updated: false, eventId: result.insertedId };
    } catch (error) {
        console.log("カレンダーイベントの操作エラー", error);
        throw error;
    }
}

// 請求書の金額を計算
const recalculateInvoiceTotal = async (invoiceId) => {
    try {
        const result = await db.collection("transactions").aggregate([
            {
                $match: { invoiceId: new ObjectId(invoiceId) }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]).toArray();

        const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

        // 請求書を更新
        await db.collection("invoices").updateOne(
            { _id: new ObjectId(invoiceId) },
            {
                $set: {
                    totalAmount: totalAmount,
                    updatedAt: new Date()
                }
            }
        );

        return totalAmount;
    } catch (error) {
        console.error("合計金額再計算エラー:", error);
    }
}

// 総売上の計算
const recalculateInvoicesTotal = async (customerId) => {
    try {
        const result = await db.collection("invoices").aggregate([
            {
                $match: {
                    customerId: new ObjectId(customerId),
                    invoiceStatus: "完了"
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]).toArray();

        const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

        // 請求書を更新
        await db.collection("customers").updateOne(
            { _id: new ObjectId(customerId) },
            {
                $set: {
                    totalAmount: totalAmount,
                    updatedAt: new Date()
                }
            }
        );

        return totalAmount;
    } catch (error) {
        console.error("合計金額再計算エラー:", error);
    }
}

// 税計算
const taxCalculation = (amount, tax_rate) => {
    return Math.round(amount * (tax_rate / 100));
}

// Google Authを実行
async function googleAuthenticate() {
    const auth = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    return auth;
}
// 大元
async function gmailMain() {
    const auth = await googleAuthenticate();
    // メッセージ(10件)の表示
    const messages = await getRecentEmails(auth);
    // メッセージデータの取得
    const msgDates = await Promise.all(
        messages.map(async (m) => await getEmailDateByMessageId(auth, m.id))
    );
    const textMessages = await Promise.all(
        msgDates.map(async (md) => {
            const payload = md.payload;
            if (!payload || !('mimeType' in payload)) return;
            if (payload.mimeType === 'multipart/alternative') {
                // 内部の最初に解決された Promise が返される
                return await Promise.any(
                    payload.parts.map((part) => parseBody(part))
                );
            } else {
                return parseBody(payload);
            }
        })
    )
    console.log(textMessages);
}
// アカウントのラベルの一覧
async function getRecentEmails(auth) {
    // 新しいGmail APIクライアントを作成
    const gmail = google.gmail({ version: 'v1', auth });
    //  新規メールを取得
    const res = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'],
        maxResults: 1,
    });
    return res.data.messages;
}
// Message IDからmessageの詳細データ取得
async function getEmailDateByMessageId(auth, messageId) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
    });
    return res.data;
}
// input の html/text 文字列からタグ情報などを取り除く
const htmlConvert = (input) => {
    // config
    const options = {
        ignoreHref: true,
        ignoreImage: true,
        noAnchorUrl: true,
        singleNewLineParagraphs: true,
    };

    return convert(input, options);
};
// payload糖のmimeTypeによって、適切ない方法で本文を取り出す
const parseBody = (container) => new Promise((resolve, reject) => {
    // 空判定
    if (!(container.body) || container.body.size === 0) reject();
    try {
        // base64 デコード
        const body = Buffer.from(container.body.data, 'base64').toString();
        if (container.mimeType === 'text/plain') {
            resolve(body);
        }
        else if (container.mimeType === 'text/html') {
            resolve(htmlConvert(body));
        }
        else {
            reject();
        }
    } catch (error) {
        reject(error);
    }
});

/*
 ダッシュボード関連
———————————————*/
// ダッシュボードアクセスした
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

// 今月の売上を取得(先月も計算するが、これは前月比の話をするため)
app.get("/api/dashboard/monthly-sales", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // 今月の開始日と終了日
        const startOfMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/01`;
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const endOfMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(lastDay).padStart(2, '0')}`;

        // 先月の開始日と終了日
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfLastMonth = `${lastMonthDate.getFullYear()}/${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}/01`;
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        const endOfLastMonth = `${lastMonthDate.getFullYear()}/${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}/${String(lastDayOfLastMonth).padStart(2, '0')}`;

        // 今月の売上のみを集計
        const currentMonthResult = await db.collection("invoices").aggregate([
            {
                $match: {
                    userId: userId,
                    invoiceRequest: {
                        $regex: /^\d{4}\/\d{2}\/\d{2}$/,
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    },
                    invoiceStatus: "完了"
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // 先月の売上を集計
        const lastMonthResult = await db.collection("invoices").aggregate([
            {
                $match: {
                    userId: userId,
                    invoiceRequest: {
                        $regex: /^\d{4}\/\d{2}\/\d{2}$/,
                        $gte: startOfLastMonth,
                        $lte: endOfLastMonth
                    },
                    invoiceStatus: "完了"
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]).toArray();

        // 定義
        const currentTotal = currentMonthResult.length > 0 ? currentMonthResult[0].totalAmount : 0;
        const currentCount = currentMonthResult.length > 0 ? currentMonthResult[0].count : 0;
        const lastTotal = lastMonthResult.length > 0 ? lastMonthResult[0].totalAmount : 0;

        // 前月比を計算
        let percentageChange = 0;
        if (lastTotal > 0) {
            percentageChange = ((currentTotal - lastTotal) / lastTotal) * 100;
        }

        res.json({
            currentMonth: {
                totalAmount: currentTotal,
                count: currentCount
            },
            lastMonth: {
                totalAmount: lastTotal
            },
            comparison: {
                percentageChange: percentageChange.toFixed(1),
                isPositive: percentageChange >= 0
            }
        })
    } catch (error) {
        console.log("売上取得エラー", error);
        res.status(500).json({ success: false, error: error.message });
    }
})

// 全体の未収金請求書を取得
app.get("/api/dashboard/unpaid-invoices", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const today = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

        const result = await db.collection("invoices").aggregate([
            {
                $match: {
                    userId: userId,
                    invoiceRequest: {
                        $regex: /^\d{4}\/\d{2}\/\d{2}$/,
                        $lt: today
                    },
                    invoiceStatus: { $in: ["取引中", "停滞中"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        const unpaidTotal = result.length > 0 ? result[0].totalAmount : 0;
        const unpaidCount = result.length > 0 ? result[0].count : 0;

        res.json({
            totalAmount: unpaidTotal,
            count: unpaidCount
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
})

/*
 顧客関連
———————————————*/
// 顧客情報追加機能
app.post('/api/customers', authenticateToken, async (req, res) => {
    try {
        const { companyName, type, category, website, phone, description, totalAmount } = req.body;
        // ユーザーIDで紐づけ
        const userId = req.user.id;

        const customer = {
            userId: userId,
            companyName: companyName,
            type: type,
            category: category,
            website: website,
            phone: phone,
            description: description,
            totalAmount: totalAmount,
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

// 一つの顧客に対する更新機能
app.put('/api/customers/:customerId', authenticateToken, async (req, res) => {
    try {
        const { companyName, type, category, website, phone, description, totalAmount } = req.body;
        const customerId = req.params.customerId;
        const userId = req.user.id;

        // あるかの確認
        const existingCustomer = await db.collection("customers").findOne({
            _id: new ObjectId(customerId),
            userId: userId
        });

        if (!existingCustomer) {
            return res.status(404).json({ success: false, error: "取引が見つかりません" });
        }

        // 更新する内容
        const updateData = {
            $set: {
                updatedAt: new Date(),
            }
        };

        // 各フィールドが存在する場合のみ追加するようにすれば、何度もfetch回数が減るはず
        if (companyName !== undefined) updateData.$set.companyName = companyName;
        if (type !== undefined) updateData.$set.type = type;
        if (category !== undefined) updateData.$set.category = category;
        if (website !== undefined) updateData.$set.website = website;
        if (phone !== undefined) updateData.$set.phone = phone;
        if (description !== undefined) updateData.$set.description = description;
        if (totalAmount !== undefined) updateData.$set.totalAmount = totalAmount;

        const result = await db.collection("customers").updateOne({
                _id: new ObjectId(customerId),
                userId: userId
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

// 一つの顧客に対する削除機能
app.delete('/api/customers/:customerId', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const result = await db.collection("customers").deleteOne({
            _id: new ObjectId(customerId),
            userId: userId
        })

        const invoicesResult = await db.collection("invoices").deleteMany({
            userId: userId,
            customerId: new ObjectId(customerId),
        });

        // 請求書の取引履歴も削除する
        const transactionResult = await db.collection("transactions").deleteMany({
            userId: userId,
            customerId: new ObjectId(customerId),
        });

        // カレンダーも削除する
        const eventResult = await db.collection("calendar-events").deleteMany({
            userId: userId,
            relatedCustomer: new ObjectId(customerId),
        });

        await recalculateInvoicesTotal(customerId);

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
        const { product, amount, transactionStatus, invoiceId, cost, tax_rate } = req.body;
        // カスタマーIDで紐づけする
        const customerId = req.params.customerId;
        // ユーザーID紐づけをする
        const userId = req.user.id;

        // 税の計算
        const taxInAmount = taxCalculation(amount, tax_rate);

        const transaction = {
            userId: userId,
            customerId: new ObjectId(customerId),
            invoiceId: new ObjectId(invoiceId),
            product: product,
            amount: amount,
            taxInAmount: taxInAmount,
            totalAmount: amount + taxInAmount,
            cost: cost,
            tax_rate: tax_rate,
            createdAt: new Date(),
        }

        const result = await db.collection("transactions").insertOne(transaction);

        // 請求書のtotalAmount計算
        await recalculateInvoiceTotal(invoiceId);
        await recalculateInvoicesTotal(customerId);

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

        const invoiceResult = await db.collection("invoices").insertOne(invoices);

        await manageCalendarEvent({
            userId: userId,
            title: `請求書: ${invoiceNumber}`,
            startTime: invoiceRequest.replace(/\//g, '-'),
            endTime: invoiceRequest.replace(/\//g, '-'),
            allDay: true,
            category: 'invoice',
            color: '#fbbf24',
            relatedInvoice: invoiceResult.insertedId,
            relatedCustomer: new ObjectId(customerId),
            status: invoiceStatus,
        });

        res.status(201).json({ success: true, invoiceResult });
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

        // 売上を計算しなおす
        await recalculateInvoiceTotal(invoiceId);
        await recalculateInvoicesTotal(customerId);

        // 既存カレンダーイベントを検索
        const existingEvent = await db.collection("calendar-events").findOne({
            relatedInvoice: new ObjectId(invoiceId),
        });

        // カレンダーイベントを更新
        await manageCalendarEvent({
            title: `請求書: ${invoiceNumber}`,
            startTime: invoiceRequest.replace(/\//g, '-'),
            endTime: invoiceRequest.replace(/\//g, '-'),
            status: invoiceStatus,
        }, existingEvent?._id);

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

        // 請求書の取引履歴も削除する
        const transactionResult = await db.collection("transactions").deleteMany({
            userId: userId,
            customerId: new ObjectId(customerId),
            invoiceId: new ObjectId(invoiceId),
        });

        // カレンダーも削除する
        const eventResult = await db.collection("calendar-events").deleteMany({
            userId: userId,
            relatedInvoice: new ObjectId(invoiceId),
            relatedCustomer: new ObjectId(customerId),
        });

        // 金額の再計算
        await recalculateInvoiceTotal(invoiceId);
        await recalculateInvoicesTotal(customerId);

        res.json({ success: true, message: "請求書が削除されました" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

/*
 請求書内の取引関連
———————————————*/
// 全ての請求書情報提供機能
app.get('/api/invoices', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const invoices = await db.collection("invoices").find({
            userId: userId,
        }).sort({ createdAt: -1 }).toArray();

        res.json(invoices);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// 一つの顧客に対する一つの請求書内の一つの取引情報修正機能
app.put('/api/customers/:customerId/invoices/:invoiceId/transactions/:transactionId', authenticateToken, async (req, res) => {
    try {
        const { product, amount, cost, tax_rate } = req.body;
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

        // 税計算
        const taxInAmount = taxCalculation(amount, tax_rate);

        // 更新する内容
        const updateData = {
            $set: {
                product: product,
                amount: amount,
                taxInAmount: taxInAmount,
                totalAmount: amount + taxInAmount,
                cost: cost,
                tax_rate: tax_rate,
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



        // 金額の再計算
        await recalculateInvoiceTotal(invoiceId);
        await recalculateInvoicesTotal(customerId);

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

        // 金額の再計算
        await recalculateInvoiceTotal(invoiceId);
        await recalculateInvoicesTotal(customerId);

        res.json({ success: true, message: "取引情報が削除されました" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

/*
 カレンダー関連
———————————————*/
// 全てのイベントを提供
app.get('/api/calendar-events', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const events = await db.collection("calendar-events").find({
            userId: userId,
        }).sort({ createdAt: -1 }).toArray();
        res.json(events);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

// 今日のイベントを提供
app.get('/api/today-calendar-events', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const now = new Date();
        const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')}`;

        const events = await db.collection("calendar-events").aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                $addFields: {
                    startDateStr: { $substr: ["$startTime", 0, 10] }
                }
            },
            {
                $match: {
                    startDateStr: todayStr
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]).toArray();

        res.json(events);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

// 予定を追加
app.post('/api/calendar-events', authenticateToken, async (req, res) => {
    try {
        const { title, description, date, startTime, endTime, category, color } = req.body;
        const userId = req.user.id;

        await manageCalendarEvent({
            userId: userId,
            title: `予定: ${title}`,
            description: description,
            date: date,
            startTime: startTime,
            endTime: endTime,
            allDay: false,
            category: category,
            color: color,
        });

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

/*
 検索関連
———————————————*/
app.get('/api/search/customer/:customerId/companyName', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const resultCompanyName = await db.collection("customers").findOne({
            _id: new ObjectId(customerId),
            userId: userId,
        }, {
            projection: { companyName: 1 }
        });

        res.json({
            companyName: resultCompanyName.companyName,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})


/*
 コメント機能関連
———————————————*/
// コメント追加
app.post('/api/customers/:customerId/comments', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;
        const { message } = req.body;

        const comments = {
            userId: userId,
            customerId: new ObjectId(customerId),
            comment: message,
            createdAt: new Date(),
        };
        const commentResult = await db.collection("comments").insertOne(comments);

        res.status(201).json({ success: true, commentResult });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

// コメント表示
app.get('/api/customers/:customerId/comments', authenticateToken, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const comments = await db.collection("comments").find({
            userId: userId,
            customerId: new ObjectId(customerId),
        }).sort({ createdAt: 1 }).toArray();

        const commentsWithName = comments.map(comment => ({
            ...comment,
            name: req.user.name
        }));

        res.json(commentsWithName);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

// サーバー起動
app.listen(PORT, () => {
    console.log(`APIサーバーがhttp://localhost:${PORT}で起動しました`);
});
