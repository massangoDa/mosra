import { db } from "../../db.js";
import {ObjectId} from "mongodb";
import {recalculateInvoicesTotal, recalculateInvoiceTotal, taxCalculation} from "../../utils/recalculate.js";
import {normalizeForSearch} from "../../utils/normalizeForSearch.js";


const getTransactions = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;
        const caseId = req.params.caseId;
        const invoiceId = req.params.invoiceId;

        const transactions = await db.collection("transactions").find({
            userId: userId,
            customerId: new ObjectId(customerId),
            caseId: new ObjectId(caseId),
            invoiceId: new ObjectId(invoiceId),
        }).toArray();

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

const updateTransaction = async (req, res) => {
    try {
        const { product, amount, cost, tax_rate } = req.body;
        const customerId = req.params.customerId;
        const transactionId = req.params.transactionId;
        const caseId = req.params.caseId;
        const invoiceId = req.params.invoiceId;
        const userId = req.user.id;

        const existingTransaction = await db.collection("transactions").findOne({
            _id: new ObjectId(transactionId),
            userId: userId,
            customerId: new ObjectId(customerId),
            caseId: new ObjectId(caseId),
            invoiceId: new ObjectId(invoiceId),
        });

        if (!existingTransaction) {
            return res.error(404);
        }

        const updateData = {
            $set: {
                product: product,
                amount: amount,
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
                caseId: new ObjectId(caseId),
            },
            updateData
        );

        if (result.modifiedCount === 0) {
            return res.error(404);
        }

        res.json({ success: true, message: "取引情報が更新されました" });
    } catch (error) {
        res.error(500, error.message);
    }
}

export default {
    getTransactions,
    createTransaction,
    updateTransaction,
}