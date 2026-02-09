import type { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import * as types from '../types/types.js'
import { createTransactionService, getTransactionsService, updateTransactionService } from '../services/transaction.service.js'

export const getTransactions = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)
        const caseId = new ObjectId(req.params.caseId)
        const invoiceId = new ObjectId(req.params.invoiceId)

        const result = await getTransactionsService(userId, customerId, caseId, invoiceId)

        res.json(result)
    } catch (error) {
        console.log('取引履歴取得でエラー発生')
        res.status(500).json('エラーが発生しました')
    }
}

export const createTransaction = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)
        const caseId = new ObjectId(req.params.caseId)
        const invoiceId = new ObjectId(req.params.invoiceId)

        const payload: types.InputTransaction = {
            ...req.body
        }

        await createTransactionService(userId, customerId, caseId, invoiceId, payload)

        res.status(201).json('取引履歴が作成されました')
    } catch (error) {
        console.log('取引履歴作成でエラー発生')
        res.status(500).json('エラーが発生しました')
    }
}

export const updateTransaction = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)
        const caseId = new ObjectId(req.params.caseId)
        const invoiceId = new ObjectId(req.params.invoiceId)
        const transactionId = new ObjectId(req.params.transactionId)

        const payload: types.InputTransaction = {
            ...req.body
        }

        await updateTransactionService(userId, customerId, caseId, invoiceId, transactionId, payload)

        res.status(200).json('取引履歴が更新されました')
    } catch (error) {
        console.log('取引履歴更新でエラー発生')
        res.status(500).json('エラーが発生しました')
    }
}