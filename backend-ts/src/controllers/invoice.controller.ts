import type { Request, Response } from 'express';
import { ObjectId } from "mongodb";
import * as types from '../types/types.js';
import {createInvoiceService, getInvoicesService} from "../services/invoice.service.js";

export const getInvoices = async (req: Request<{ customerId: string, caseId: string }>, res: Response) => {
    try {
        const userId = req.user.id;
        const customerId = new ObjectId(req.params.customerId);
        const caseId = new ObjectId(req.params.caseId);

        const result = await getInvoicesService(userId, customerId, caseId);

        res.json(result);
    } catch (error) {
        console.log("請求書の取得でエラー発生");
        res.status(500).json("エラーが発生しました");
    }
}

export const createInvoice = async (req: Request<{ customerId: string, caseId: string }>, res: Response) => {
    try {
        const customerId = new ObjectId(req.params.customerId);
        const caseId = new ObjectId(req.params.caseId);
        const userId = req.user.id;

        const payload: types.InputInvoice = {
            ...req.body,
        }

        await createInvoiceService(userId, customerId, caseId, payload);

        res.status(201).json("請求書を作成しました");
    } catch (error) {
        console.log("請求書の作成でエラー発生");
        if (error instanceof Error && error.message === "NOT_FOUND") {
            res.status(404).json("顧客が見つかりません");
        } else {
            res.status(500).json("エラーが発生しました");
        }
    }
}