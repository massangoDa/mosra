import { db } from "../db.js";
import {ObjectId} from "mongodb";
import {recalculateInvoicesTotal, recalculateInvoiceTotal, taxCalculation} from "../utils/recalculate.js";
import {normalizeForSearch} from "../utils/normalizeForSearch.js";


const getTransactions = async (req, res) => {
    try {
        // ユーザーIDとカスタマーIDで紐づいている。
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const transactions = await db.collection("transactions").find({
            userId: userId,
            customerId: new ObjectId(customerId)
        }).sort({ createdAt: -1 }).toArray();

        res.json(transactions);
    } catch (error) {
        console.log("取引履歴取得でエラー発生");
        res.error(500, error.message);
    }
}

const createTransaction = async (req, res) => {
    try {
        // ボディーから受け取るものは後で決める
        const { product, amount, transactionStatus, invoiceId, cost, tax_rate } = req.body;
        // カスタマーIDで紐づけする
        const customerId = req.params.customerId;
        // ユーザーID紐づけをする
        const userId = req.user.id;

        // 税の計算
        const taxInAmount = taxCalculation(amount, tax_rate);

        // 正規化関数で曖昧検索できるようにする
        const searchProduct = normalizeForSearch(product);

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
            searchProduct: searchProduct,
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
};

export default {
    getTransactions,
    createTransaction,
}