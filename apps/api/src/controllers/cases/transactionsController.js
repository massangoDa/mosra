import { db } from "../../db.js";
import {ObjectId} from "mongodb";
import {recalculateInvoicesTotal, recalculateInvoiceTotal, taxCalculation} from "../../utils/recalculate.js";
import {normalizeForSearch} from "../../utils/normalizeForSearch.js";


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
        const { product, amount, cost, tax_rate } = req.body;
        const customerId = req.params.customerId;
        const caseId = req.params.caseId;
        const invoiceId = req.params.invoiceId;
        const userId = req.user.id;

        const transaction = {
            userId: userId,
            customerId: new ObjectId(customerId),
            caseId: new ObjectId(caseId),
            invoiceId: new ObjectId(invoiceId),
            product: product,
            amount: amount,
            cost: cost,
            tax_rate: tax_rate,
            createdAt: new Date(),
        }

        const result = await db.collection("transactions").insertOne(transaction);

        res.status(201).json({ success: true, customerId: result.insertedId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export default {
    getTransactions,
    createTransaction,
}