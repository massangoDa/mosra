import { db } from "../db.js";
import {ObjectId} from "mongodb";
import {recalculateInvoicesTotal, recalculateInvoiceTotal, taxCalculation} from "../utils/recalculate.js";
import {normalizeForSearch} from "../utils/normalizeForSearch.js";
import {manageCalendarEvent} from "../utils/manageCalendarEvent.js";


const getInvoices = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const caseId = req.params.caseId;
        const userId = req.user.id;

        const invoices = await db.collection("invoices").find({
            userId: userId,
            customerId: new ObjectId(customerId),
            caseId: new ObjectId(caseId),
        }).sort({ createdAt: -1 }).toArray();

        res.json(invoices);
    } catch (error) {
        console.log("請求書の取得でエラー発生");
        res.error(500, error.message);
    }
}

const createInvoice = async (req, res) => {
    try {
        const { invoiceNumber, totalAmount, invoiceRequest, invoiceStatus } = req.body;
        const customerId = req.params.customerId;
        const caseId = req.params.caseId;
        const userId = req.user.id;

        const invoices = {
            userId: userId,
            customerId: new ObjectId(customerId),
            caseId: new ObjectId(caseId),
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

        res.success(201);
    } catch (error) {
        res.error(500, error.message);
    }
}

const getInvoice = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;
        const invoiceId = req.params.invoiceId;

        const invoices = await db.collection("invoices").findOne({
            userId: userId,
            customerId: new ObjectId(customerId),
            _id: new ObjectId(invoiceId),
        });

        res.json(invoices);
    } catch (error) {
        res.error(500, error.message);
    }
}

const updateInvoice = async (req, res) => {
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
            return res.error(404);
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
        res.error(500, error.message);
    }
}

const deleteInvoice = async (req, res) => {
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
        res.error(500, error.message);
    }
}

const getInvoiceTransactions = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;
        const invoiceId = req.params.invoiceId;

        const transactions = await db.collection("transactions").find({
            userId: userId,
            customerId: new ObjectId(customerId),
            invoiceId: new ObjectId(invoiceId),
        }).sort({ createdAt: -1 }).toArray();

        res.json(transactions);
    } catch (error) {
        console.log("請求書内の取引情報一覧取得でエラー発生");
        res.error(500, error.message);
    }
}

const getInvoiceTransaction = async (req, res) => {
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
        res.error(500, error.message);
    }
}

const updateInvoiceTransaction = async (req, res) => {
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
            return res.error(404);
        }

        // 税計算
        const taxInAmount = taxCalculation(amount, tax_rate);

        // 正規化関数で曖昧検索できるようにする
        const searchProduct = normalizeForSearch(product);

        // 更新する内容
        const updateData = {
            $set: {
                product: product,
                amount: amount,
                taxInAmount: taxInAmount,
                totalAmount: amount + taxInAmount,
                cost: cost,
                tax_rate: tax_rate,
                searchProduct: searchProduct,
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
            return res.error(404);
        }



        // 金額の再計算
        await recalculateInvoiceTotal(invoiceId);
        await recalculateInvoicesTotal(customerId);

        res.json({ success: true, message: "取引情報が更新されました" });
    } catch (error) {
        res.error(500, error.message);
    }
}

const deleteInvoiceTransaction = async (req, res) => {
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
        res.error(500, error.message);
    }
}


export default {
    getInvoices,
    createInvoice,
    getInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceTransactions,
    getInvoiceTransaction,
    updateInvoiceTransaction,
    deleteInvoiceTransaction,
}