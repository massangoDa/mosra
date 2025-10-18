import { db } from '../db.js';
import {ObjectId} from "mongodb";

export const recalculateInvoicesTotal = async (customerId) => {
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

        // 顧客情報を更新
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
        throw error;
    }
}

export const recalculateInvoiceTotal = async (invoiceId) => {
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

// 税計算
export const taxCalculation = (amount, tax_rate) => {
    return Math.round(amount * (tax_rate / 100));
}