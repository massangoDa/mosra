import type { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import * as types from '../types/types.js'
import {
    createTransactionService,
    deleteTransactionService,
    getTransactionService,
    getTransactionsService,
    updateTransactionService,
} from '../services/transaction.service.js'
import { InputTransactionSchema } from '../schema/input.schema.js'

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

        const payload = InputTransactionSchema.parse(req.body)

        await createTransactionService(userId, customerId, caseId, invoiceId, payload)

        res.status(201).json('取引履歴が作成されました')
    } catch (error) {
        console.log('取引履歴作成でエラー発生')
        if (error instanceof Error && error.message === 'NOT_FOUND') {
            res.status(404).json('請求書が見つかりません')
        } else {
            res.status(500).json('エラーが発生しました')
        }
    }
}

export const getTransaction = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)
        const caseId = new ObjectId(req.params.caseId)
        const invoiceId = new ObjectId(req.params.invoiceId)
        const transactionId = new ObjectId(req.params.transactionId)

        const result = await getTransactionService(userId, customerId, caseId, invoiceId, transactionId)

        res.json(result)
    } catch (error) {
        res.status(500).json("エラーが発生しました")
    }
}

export const updateTransaction = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)
        const caseId = new ObjectId(req.params.caseId)
        const invoiceId = new ObjectId(req.params.invoiceId)
        const transactionId = new ObjectId(req.params.transactionId)

        const payload = InputTransactionSchema.parse(req.body)

        await updateTransactionService(userId, customerId, caseId, invoiceId, transactionId, payload)

        res.status(200).json('取引履歴が更新されました')
    } catch (error) {
        console.log('取引履歴更新でエラー発生')
        if (error instanceof Error && error.message === 'NOT_FOUND') {
            res.status(404).json('請求書が見つかりません')
        } else {
            res.status(500).json('エラーが発生しました')
        }
    }
}

export const deleteTransaction = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)
        const caseId = new ObjectId(req.params.caseId)
        const invoiceId = new ObjectId(req.params.invoiceId)
        const transactionId = new ObjectId(req.params.transactionId)

        await deleteTransactionService(userId, customerId, caseId, invoiceId, transactionId)

        res.status(200).json('取引履歴が削除されました')
    } catch (error) {
        res.status(500).json("エラーが発生しました")
    }
}