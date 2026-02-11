import type { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import * as types from '../types/types.js'
import {
    createContactService,
    deleteContactService,
    getContactService,
    getContactsService,
    updateContactService,
} from '../services/contact.service.js'
import { InputContactSchema } from '../schema/input.schema.js'

export const getContacts = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id

        const result = await getContactsService(userId)

        res.json(result)
    } catch (error) {
        console.log('連絡先取得でエラー発生', error)
        res.status(500).json('エラーが発生しました')
    }
}

export const createContact = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id

        const payload = InputContactSchema.parse(req.body)

        await createContactService(userId, payload)

        res.status(201).json('連絡先を作成しました')
    } catch (error) {
        console.log('連絡先を追加でエラー発生', error)
        res.status(500).json('エラーが発生しました')
    }
}

export const getContact = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const contactId = new ObjectId(req.params.contactId)

        const result = await getContactService(userId, contactId)

        res.json(result)
    } catch (error) {
        console.log('連絡先取得でエラー発生', error)
        res.status(500).json('エラーが発生しました')
    }
}

export const updateContact = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const contactId = new ObjectId(req.params.contactId)

        const payload = InputContactSchema.parse(req.body)

        await updateContactService(userId, contactId, payload)

        res.status(200).json('連絡先を更新しました')
    } catch (error) {
        console.log('連絡先更新でエラー発生', error)
        res.status(500).json('エラーが発生しました')
    }
}

export const deleteContact = async (req: Request<types.AppParams>, res: Response) => {
    try {
        const userId = req.user.id
        const contactId = new ObjectId(req.params.contactId)

        await deleteContactService(userId, contactId)

        res.status(200).json('連絡先の削除に成功しました')
    } catch (error) {
        console.log('連絡先の削除でエラーが発生', error)
        res.status(500).json('エラーが発生しました')
    }
}