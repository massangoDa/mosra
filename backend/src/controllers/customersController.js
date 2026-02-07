import { db } from '../db.js'
import {ObjectId} from "mongodb";

const getCustomers = async (req, res) => {
    try {
        const userId = req.user.id;

        const customers = await db.collection("customers").find({ userId }).sort({ createdAt: -1 }).toArray();

        res.json(customers);
    } catch (error) {
        console.log("顧客取得でエラーが発生", error);
        res.error(500, error.message)
    }
}

const createCustomer = async (req, res) => {
    const session = db.client.startSession();

    try {
        await session.withTransaction(async () => {
            const { contactId } = req.body;
            const userId = req.user.id;

            const result = await db.collection("customers").insertOne(
                {
                    userId: userId,
                    ...req.body,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                { session }
            );

            if (!result) {
                throw new Error("NOT_FOUND")
            }

            const customerId = result.insertedId;

            const contactResult = await db.collection("contacts").findOneAndUpdate(
                {
                    _id: new ObjectId(contactId),
                    userId: userId
                },
                {
                    $set: {
                        customerId: new ObjectId(customerId),
                        updatedAt: new Date()
                    }
                },
                { session }
            );

            if (!contactResult) {
                throw new Error("NOT_FOUND")
            }
        });
        res.success(201, "顧客を作成しました");
    } catch (error) {
        console.log("顧客作成でエラーが発生:", error);
        if (error.message === "NOT_FOUND") {
            res.error(404, "顧客が見つからなかったか、作成に失敗しました");
        } else {
            res.error(500, error.message);
        }
    } finally {
        await session.endSession();
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
    const session = db.client.startSession();

    try {
        await session.withTransaction(async () => {
            const { contactId } = req.body;
            const customerId = req.params.customerId;
            const userId = req.user.id;

            const result = await db.collection("customers").findOneAndUpdate(
                {
                    _id: new ObjectId(customerId),
                    userId: userId,
                },
                {
                    $set: {
                        ...req.body,
                        updatedAt: new Date()
                    }
                },
                { session }
            );

            if (!result) {
                throw new Error("NOT_FOUND")
            }

            if (contactId) {
                const contactResult = await db.collection("contacts").findOneAndUpdate(
                    {
                        _id: new ObjectId(contactId),
                        userId: userId
                    },
                    {
                        $set: {
                            customerId: new ObjectId(customerId),
                            updatedAt: new Date()
                        }
                    },
                    { session }
                );

                if (!contactResult) {
                    throw new Error("NOT_FOUND")
                }
            }
        });

        res.success(200, "顧客情報を更新しました");
    } catch (error) {
        console.log("顧客情報更新でエラーが発生", error);
        if (error.message === "NOT_FOUND") {
            res.error(404, "顧客が見つからなかったか、更新に失敗しました");
        } else {
            res.error(500, error.message);
        }
    } finally {
        await session.endSession();
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