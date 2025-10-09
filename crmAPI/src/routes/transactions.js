import authenticateToken from "./auth.js";
import {ObjectId} from "mongodb";
import express from "express";
import {recalculateInvoicesTotal, recalculateInvoiceTotal} from "../index.js";

const router = express.Router();

// api/customers/:customerId/transactions がbase

export default (db) => {
    // 一つの顧客に対する取引情報追加機能
    router.post('/', authenticateToken, async (req, res) => {
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

            // 請求書のtotalAmount計算
            await recalculateInvoiceTotal(invoiceId);
            await recalculateInvoicesTotal(customerId);

            res.status(201).json({ success: true, customerId: result.insertedId });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    })

    // 一つの顧客に対する取引情報提供機能(現在は不使用だが、一覧を表示するときに必要)
    router.get('/', authenticateToken, async (req, res) => {
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

    return router;
}