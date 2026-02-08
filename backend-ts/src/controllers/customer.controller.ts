import { db } from '../utils/db.js';
import type { Request, Response } from 'express';
import { ObjectId } from "mongodb";
import * as types from '../types/types.js';


export const getCustomers = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const customers = await db.collection("customers").find(
            {
                userId: new ObjectId(userId)
            }
        ).sort({ createdAt: -1 }).toArray();

        res.json(customers);
    } catch (error) {
        console.log("顧客取得でエラーが発生", error);
        res.status(500).json("エラーが発生しました")
    }
}

export const createCustomer = async (req: Request, res: Response) => {
    const session = db.client.startSession();

    try {
        await session.withTransaction(async () => {
            const { companyName, type, category, website, phone, description, contactId} = req.body;
            const userId = req.user.id;

            const result = await db.collection<types.Customer>("customers").insertOne(
                {
                    userId: new ObjectId(userId),
                    companyName,
                    type,
                    category,
                    website,
                    phone,
                    description,
                    contactId: contactId ? new ObjectId(contactId) : null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                { session }
            );

            if (!result.insertedId) {
                throw new Error("NOT_FOUND")
            }

            const customerId = result.insertedId;

            if (contactId) {
                const contactResult = await db.collection("contacts").findOneAndUpdate(
                    {
                        _id: new ObjectId(contactId),
                        userId: new ObjectId(userId)
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
        res.status(201).json("顧客を作成しました");
    } catch (error) {
        console.log("顧客作成でエラーが発生:", error);
        if (error instanceof Error && error.message === "NOT_FOUND") {
            res.status(404).json("顧客が見つからなかったか、作成に失敗しました");
        } else {
            res.status(500).json("エラーが発生しました");
        }
    } finally {
        await session.endSession();
    }
}

export const updateCustomer = async (req: Request<{ customerId: string }>, res: Response) => {
    const session = db.client.startSession();

    try {
        await session.withTransaction(async () => {
            const { companyName, type, category, website, phone, description, contactId} = req.body;
            const customerId = req.params.customerId;
            const userId = req.user.id;

            const result = await db.collection<types.Customer>("customers").findOneAndUpdate(
                {
                    _id: new ObjectId(customerId),
                    userId: new ObjectId(userId)
                },
                {
                    $set: {
                        companyName,
                        type,
                        category,
                        website,
                        phone,
                        description,
                        contactId: new ObjectId(contactId),
                        updatedAt: new Date()
                    }
                },
                { session }
            );

            if (!result) {
                throw new Error("NOT_FOUND")
            }

            if (contactId) {
                const contactResult = await db.collection<types.Customer>("contacts").findOneAndUpdate(
                    {
                        _id: new ObjectId(contactId),
                        userId: new ObjectId(userId)
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

        res.status(200).json("顧客情報を更新しました");
    } catch (error) {
        console.log("顧客情報更新でエラーが発生", error);
        if (error instanceof Error && error.message === "NOT_FOUND") {
            res.status(404).json("顧客が見つからなかったか、更新に失敗しました");
        } else {
            res.status(500).json("エラーが発生しました");
        }
    } finally {
        await session.endSession();
    }
}