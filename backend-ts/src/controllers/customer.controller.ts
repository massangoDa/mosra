import { db } from '../utils/db.js';
import type { Request, Response } from 'express';

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const customers = await db.collection("customers").find(
            {
                userId: userId
            }
        ).sort({ createdAt: -1 }).toArray();

        res.json(customers);
    } catch (error: any) {
        console.log("顧客取得でエラーが発生", error);
        res.status(500).json("エラーが発生しました")
    }
}