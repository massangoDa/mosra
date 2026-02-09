import type { ObjectId } from 'mongodb'
import { db } from '../utils/db.js'
import * as types from '../types/types.js'

export const getCasesService = async (userId: ObjectId, customerId: ObjectId) => {
    return await db
        .collection('cases')
        .find({
            userId,
            customerId,
        })
        .sort({ createdAt: -1 })
        .toArray()
}

export const createCaseService = async (userId: ObjectId, customerId: ObjectId, data: types.InputCase) => {
    return await db.collection<types.CreateCase>('cases').insertOne({
        userId,
        customerId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
    })
}

export const getCaseService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId) => {
    return await db.collection('cases').findOne({
        _id: caseId,
        userId,
        customerId,
    })
}

export const updateCaseService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, data: types.InputCase) => {
    return await db.collection<types.Case>('cases').findOneAndUpdate(
        {
            _id: caseId,
            userId,
            customerId,
        },
        {
            $set: {
                ...data,
                updatedAt: new Date(),
            },
        }
    )
}

export const deleteCaseService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId) => {
    const session = db.client.startSession()

    try {
        await session.withTransaction(async () => {
            const result = await db.collection('cases').deleteOne(
                {
                    _id: caseId,
                    userId,
                    customerId,
                },
                { session }
            )

            if (result.deletedCount === 0) {
                throw new Error('NOT_FOUND')
            }

            await db.collection('invoices').deleteMany(
                {
                    caseId,
                    customerId,
                    userId,
                },
                { session }
            )
            await db.collection('transactions').deleteMany(
                {
                    caseId,
                    customerId,
                    userId,
                },
                { session }
            )
        })
    } finally {
        await session.endSession()
    }
}
