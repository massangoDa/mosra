import authenticateToken from "./auth.js";
import {ObjectId} from "mongodb";
import express from "express";

const router = express.Router();

// api/customers がbase

export default (db) => {
    // 顧客情報追加機能
    router.post('/', authenticateToken, async (req, res) => {
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
    router.get('/', authenticateToken, async (req, res) => {
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
    router.get('/:customerId', authenticateToken, async (req, res) => {
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
    router.put('/:customerId', authenticateToken, async (req, res) => {
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
    router.delete('/:customerId', authenticateToken, async (req, res) => {
        try {
            const customerId = req.params.customerId;
            const userId = req.user.id;

            const result = await db.collection("customers").deleteOne({
                _id: new ObjectId(customerId),
                userId: userId
            })

            await recalculateInvoicesTotal(customerId);

            res.json({ success: true, message: "顧客の削除に成功しました" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    })

    return router;
}