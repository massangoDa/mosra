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
    const session = db.client.startSession()

    try {
        return await session.withTransaction(async () => {
            await db.collection<types.CreateTransaction>("transactions").insertOne(
                {
                    userId,
                    customerId,
                    caseId,
                    invoiceId,
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                { session }
            )

            if (data.amount && data.tax_rate) {
                const transactionTotal = Math.round(data.amount * data.tax_rate)

                const result = await db.collection<types.Invoice>('invoices').updateOne(
                    {
                        _id: invoiceId,
                        userId,
                    },
                    {
                        $inc: {
                            totalAmount: transactionTotal,
                        },
                        $set: {
                            updatedAt: new Date(),
                        },
                    },
                    { session }
                )

                if (result.matchedCount === 0) {
                    throw new Error('NOT_FOUND')
                }
            }
        })
    } finally {
        await session.endSession()
    }
}

export const getTransactionService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, invoiceId: ObjectId, transactionId: ObjectId) => {
    return await db.collection<types.Transaction>("transactions").findOne(
        {
            _id: transactionId,
            userId,
            customerId,
            caseId,
            invoiceId
        }
    )
}

export const updateTransactionService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, invoiceId: ObjectId, transactionId: ObjectId, data: types.InputTransaction) => {
    const session = db.client.startSession()

    try {
        return await session.withTransaction(async () => {
            await db.collection<types.Transaction>("transactions").findOneAndUpdate(
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
                },
                { session }
            )

            if (data.amount && data.tax_rate) {
                const transactionTotal = Math.round(data.amount * data.tax_rate)

                const result = await db.collection<types.Invoice>('invoices').updateOne(
                    {
                        _id: invoiceId,
                        userId,
                    },
                    {
                        $inc: {
                            totalAmount: transactionTotal,
                        },
                        $set: {
                            updatedAt: new Date(),
                        },
                    },
                    { session }
                )

                if (result.matchedCount === 0) {
                    throw new Error('NOT_FOUND')
                }
            }
        })
    } finally {
        await session.endSession()
    }
}

export const deleteTransactionService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, invoiceId: ObjectId, transactionId: ObjectId) => {
    return await db.collection<types.Transaction>("transactions").deleteOne(
        {
            _id: transactionId,
            userId,
            customerId,
            invoiceId
        }
    )
}