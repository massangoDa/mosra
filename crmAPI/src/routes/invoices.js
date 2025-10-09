import authenticateToken from "./auth.js";
import {ObjectId} from "mongodb";
import express from "express";
import {manageCalendarEvent, recalculateInvoicesTotal, recalculateInvoiceTotal} from "../index.js";

const router = express.Router();

// api/customers/:customerId/invoices がbase

export default (db) => {
    // 一つの顧客に対する請求書追加機能
    router.post('/', authenticateToken, async (req, res) => {
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
    router.get('/', authenticateToken, async (req, res) => {
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
    router.get('/:invoiceId', authenticateToken, async (req, res) => {
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

    // 一つの顧客に対する請求書修正機能
    router.put('/:invoiceId', authenticateToken, async (req, res) => {
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
    router.delete('/:invoiceId', authenticateToken, async (req, res) => {
        try {
            const customerId = req.params.customerId;
            const invoiceId = req.params.invoiceId;
            const userId = req.user.id;

            const result = await db.collection("invoices").deleteOne({
                _id: new ObjectId(invoiceId),
                userId: userId,
                customerId: new ObjectId(customerId),
            });

            // 金額の再計算
            await recalculateInvoiceTotal(invoiceId);
            await recalculateInvoicesTotal(customerId);

            res.json({ success: true, message: "請求書が削除されました" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    })

    // 一つの顧客に対する一つの請求書内の取引情報提供機能
    router.get('/:invoiceId/transactions', authenticateToken, async (req, res) => {
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

    return router;
}