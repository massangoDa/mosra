import { ObjectId } from 'mongodb'
import { db } from '../utils/db.js'
import * as types from '../types/types.js'

export const getCustomersService = async (userId: ObjectId) => {
    return await db
        .collection<types.Customer>('customers')
        .find({
            userId,
        })
        .sort({ createdAt: -1 })
        .toArray()
}

export const createCustomerService = async (userId: ObjectId, data: types.InputCustomer) => {
    const session = db.client.startSession()

    try {
        return await session.withTransaction(async () => {
            const result = await db.collection<types.CreateCustomer>('customers').insertOne(
                {
                    userId,
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                { session }
            )

            if (!result.insertedId) {
                throw new Error('NOT_FOUND')
            }

            const customerId = result.insertedId

            if (data.contactId) {
                const contactResult = await db.collection('contacts').findOneAndUpdate(
                    {
                        _id: data.contactId,
                        userId,
                    },
                    {
                        $set: {
                            customerId: customerId,
                            updatedAt: new Date(),
                        },
                    },
                    { session }
                )

                if (!contactResult) {
                    throw new Error('NOT_FOUND')
                }
            }
        })
    } finally {
        await session.endSession()
    }
}

export const getCustomerService = async (userId: ObjectId, customerId: ObjectId) => {
    return await db.collection<types.Customer>('customers').findOne({
        _id: customerId,
        userId,
    })
}

export const updateCustomerService = async (userId: ObjectId, customerId: ObjectId, data: types.InputCustomer) => {
    const session = db.client.startSession()

    try {
        await session.withTransaction(async () => {
            const result = await db.collection<types.Customer>('customers').findOneAndUpdate(
                {
                    _id: customerId,
                    userId,
                },
                {
                    $set: {
                        ...data,
                        updatedAt: new Date(),
                    },
                },
                { session }
            )

            if (!result) {
                throw new Error('NOT_FOUND')
            }

            if (data.contactId) {
                const contactResult = await db.collection<types.Customer>('contacts').findOneAndUpdate(
                    {
                        _id: data.contactId,
                        userId,
                    },
                    {
                        $set: {
                            customerId,
                            updatedAt: new Date(),
                        },
                    },
                    { session }
                )

                if (!contactResult) {
                    throw new Error('NOT_FOUND')
                }
            }
        })
    } finally {
        await session.endSession()
    }
}

export const deleteCustomerService = async (userId: ObjectId, customerId: ObjectId) => {
    const session = db.client.startSession()

    try {
        return await session.withTransaction(async () => {
            const result = await db.collection('customers').deleteOne(
                {
                    _id: customerId,
                    userId,
                },
                { session }
            )

            if (result.deletedCount === 0) throw new Error('NOT_FOUND')

            await db.collection('invoices').deleteMany(
                {
                    userId,
                    customerId,
                },
                { session }
            )

            await db.collection('transactions').deleteMany(
                {
                    userId,
                    customerId,
                },
                { session }
            )

            await db.collection('calendar-events').deleteMany(
                {
                    userId,
                    relatedCustomer: customerId,
                },
                { session }
            )
        })
    } finally {
        await session.endSession()
    }
}
