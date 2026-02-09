import { ObjectId } from 'mongodb'
import { db } from '../utils/db.js'
import * as types from '../types/types.js'

export const getTransactionsService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, invoiceId: ObjectId) => {
    return await db.collection<types.Transaction>("transactions").find(
        {
            userId,
            customerId,
            caseId,
            invoiceId
        }
    ).toArray()
}

export const createTransactionService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, invoiceId: ObjectId, data: types.InputTransaction) => {
    return await db.collection<types.CreateTransaction>("transactions").insertOne(
        {
            userId,
            customerId,
            caseId,
            invoiceId,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    )
}

export const updateTransactionService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, invoiceId: ObjectId, transactionId: ObjectId, data: types.InputTransaction) => {
    return await db.collection<types.Transaction>("transactions").findOneAndUpdate(
        {
            _id: transactionId,
            userId,
            customerId,
            caseId,
            invoiceId
        },
        {
            $set: {
                ...data,
                updatedAt: new Date()
            }
        }
    )
}