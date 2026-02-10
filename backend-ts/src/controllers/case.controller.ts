import type { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import * as types from '../types/types.js'
import { createCaseService, deleteCaseService, getCaseService, getCasesService, updateCaseService } from '../services/case.service.js'
import { InputCaseSchema } from '../schema/input.schema.js'

export const getCases = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)

        const result = await getCasesService(userId, customerId)

        res.json(result)
    } catch (error) {
        console.log('案件検索でエラー')
        res.status(500).json('エラーが発生しました')
    }
}

export const createCase = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)

        const payload = InputCaseSchema.parse(req.body)

        await createCaseService(userId, customerId, payload)

        res.status(201).json('案件を作成しました')
    } catch (error) {
        console.log('案件作成でエラー', error)
        res.status(500).json('エラーが発生しました')
    }
}

export const getCase = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)
        const caseId = new ObjectId(req.params.caseId)

        const result = await getCaseService(userId, customerId, caseId)

        res.json(result)
    } catch (error) {
        console.log('案件(単)取得でエラーが発生:', error)
        res.status(500).json('エラーが発生しました')
    }
}

export const updateCase = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const customerId = new ObjectId(req.params.customerId)
        const caseId = new ObjectId(req.params.caseId)
        const userId = req.user.id

        const payload = InputCaseSchema.parse(req.body)

        await updateCaseService(userId, customerId, caseId, payload)

        res.status(200).json('案件を更新しました')
    } catch (error) {
        console.log('案件更新でエラーが発生:', error)
        res.status(500).json('エラーが発生しました')
    }
}

export const deleteCase = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)
        const caseId = new ObjectId(req.params.caseId)

        await deleteCaseService(userId, customerId, caseId)

        res.status(200).json('案件を削除しました')
    } catch (error) {
        console.log('案件削除でエラーが発生:', error)
        if (error instanceof Error && error.message === 'NOT_FOUND') {
            res.status(404).json('案件が見つかりませんでした')
        } else {
            res.status(500).json('エラーが発生しました')
        }
    }
}
