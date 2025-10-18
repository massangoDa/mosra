import { db } from '../db.js'
import {ObjectId} from "mongodb";

const getCustomers = async (req, res) => {
    try {
        const userId = req.user.id;

        const customers = await db.collection("customers").find({ userId }).sort({ createdAt: -1 }).toArray();

        res.json(customers);
    } catch (error) {
        console.log("カスタマー取得でエラーが発生", error);
        res.error(500, error.message)
    }
}

const createCustomer = async (req, res) => {
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
        res.success(201);
    } catch (error) {
        console.log("カスタマー作成でエラーが発生:", error);
        res.error(500, error.message);
    }
}

const getCustomer = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;
        const customer = await db.collection("customers").findOne({
            userId: userId,
            _id: new ObjectId(customerId)
        });

        res.json(customer);
    } catch (error) {
        res.error(500, error.message);
    }
}

const updateCustomer = async (req, res) => {
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
            return res.error(404);
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
            return res.error(404);
        }

        res.json({ success: true, message: "顧客情報が更新されました" });
    } catch (error) {
        console.log("顧客情報更新でエラーが発生", error);
        res.error(500, error.message);
    }
}

const deleteCustomer = async (req, res) => {
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

        res.json({ success: true, message: "顧客の削除に成功しました" });
    } catch (error) {
        console.log("顧客情報削除でエラーが発生", error);
        res.error(500, error.message);
    }
}

export default {
    getCustomers,
    createCustomer,
    getCustomer,
    updateCustomer,
    deleteCustomer,
}