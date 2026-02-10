import type { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import * as types from '../types/types.js'
import { searchCompanyNameService } from '../services/search.service.js'

export const searchCompanyName = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const customerId = new ObjectId(req.params.customerId)

        const result = await searchCompanyNameService(userId, customerId)

        res.json(result)
    } catch (error) {
        res.status(500).json("エラーが発生しました")
    }
}