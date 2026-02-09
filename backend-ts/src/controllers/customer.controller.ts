import type { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import * as types from '../types/types.js'
import {
    createCustomerService,
    deleteCustomerService,
    getCustomerService,
    getCustomersService,
    updateCustomerService,
} from '../services/customer.service.js'

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id

        const customers = await getCustomersService(userId)

        res.json(customers)
    } catch (error) {
        console.log('顧客取得でエラーが発生', error)
        res.status(500).json('エラーが発生しました')
    }
}

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id

        const payload: types.InputCustomer = {
            ...req.body,
            contactId: req.body.contactId ? new ObjectId(req.body.contactId) : null,
        }

        await createCustomerService(userId, payload)

        res.status(201).json('顧客を作成しました')
    } catch (error) {
        console.log('顧客作成でエラーが発生:', error)
        if (error instanceof Error && error.message === 'NOT_FOUND') {
            return res.status(404).json('顧客が見つからなかったか、作成に失敗しました')
        } else {
            return res.status(500).json('エラーが発生しました')
        }
    }
}

export const getCustomer = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const customerId = new ObjectId(req.params.customerId)
        const userId = req.user.id

        const customer = await getCustomerService(userId, customerId)

        if (!customer) return res.status(404).json('顧客が見つかりません')
        res.json(customer)
    } catch (error) {
        res.status(500).json('エラーが発生しました')
    }
}

export const updateCustomer = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const customerId = new ObjectId(req.params.customerId)
        const userId = req.user.id

        const payload: types.InputCustomer = {
            ...req.body,
            contactId: req.body.contactId ? new ObjectId(req.body.contactId) : null,
        }

        await updateCustomerService(userId, customerId, payload)

        res.status(200).json('顧客情報を更新しました')
    } catch (error) {
        console.log('顧客情報更新でエラーが発生', error)
        if (error instanceof Error && error.message === 'NOT_FOUND') {
            res.status(404).json('顧客が見つからなかったか、更新に失敗しました')
        } else {
            res.status(500).json('エラーが発生しました')
        }
    }
}

export const deleteCustomer = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const customerId = new ObjectId(req.params.customerId)
        const userId = req.user.id

        await deleteCustomerService(userId, customerId)

        res.status(200).json('顧客の削除に成功しました')
    } catch (error) {
        console.log('顧客情報削除でエラーが発生', error)
        if (error instanceof Error && error.message === 'NOT_FOUND') {
            res.status(404).json('顧客が見つからなかったか、削除に失敗しました')
        } else {
            res.status(500).json('エラーが発生しました')
        }
    }
}
