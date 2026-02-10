import { ObjectId } from 'mongodb'
import { db } from '../utils/db.js'
import * as types from '../types/types.js'
import { createCalendarEvent, updateCalendarEvent } from '../utils/manageCalendarEvent.js'

export const getInvoicesService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId) => {
    return await db
        .collection<types.Invoice>('invoices')
        .find({
            userId,
            customerId,
            caseId,
        })
        .sort({ createdAt: -1 })
        .toArray()
}

export const createInvoiceService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, data: types.InputInvoice) => {
    const session = db.client.startSession()

    try {
        return await session.withTransaction(async () => {
            const result = await db.collection<types.CreateInvoice>('invoices').insertOne(
                {
                    userId,
                    customerId,
                    caseId,
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                { session }
            )

            if (!result.insertedId) throw new Error('NOT_FOUND')

            await createCalendarEvent(
                {
                    userId: userId,
                    title: `請求書: ${data.invoiceNumber}`,
                    ...(data.invoiceRequest && {
                        date: data.invoiceRequest,
                        startTime: data.invoiceRequest,
                        endTime: data.invoiceRequest,
                    }),
                    allDay: true,
                    category: 'invoice',
                    color: '#fbbf24',
                    relatedInvoice: result.insertedId,
                    relatedCustomer: customerId,
                    ...(data.invoiceStatus && { status: data.invoiceStatus }),
                },
                { session }
            )
        })
    } finally {
        await session.endSession()
    }
}

export const getInvoiceService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, invoiceId: ObjectId) => {
    return await db.collection<types.Invoice>('invoices').findOne({
        _id: invoiceId,
        userId,
        customerId,
        caseId,
    })
}

export const updateInvoiceService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, invoiceId: ObjectId, data: types.InputInvoice) => {
    const session = db.client.startSession()

    try {
        return await session.withTransaction(async () => {
            const result = await db.collection<types.Invoice>("invoices").findOneAndUpdate(
                {
                    _id: invoiceId,
                    userId,
                    customerId,
                    caseId,
                },
                {
                    $set: {
                        ...data,
                        updatedAt: new Date()
                    }
                },
                { session }
            )

            if (!result) throw new Error("INVOICE_UPDATE_FAILED")

            const resultEvent = await db.collection<types.InputCalendarEvent>("calendar-events").findOne(
                {
                    userId: userId,
                    relatedInvoice: invoiceId,
                }
            )

            if (resultEvent) {
                await updateCalendarEvent(
                    {
                        userId: userId,
                        title: `請求書: ${data.invoiceNumber}`,
                        ...(data.invoiceRequest && {
                            date: data.invoiceRequest,
                            startTime: data.invoiceRequest,
                            endTime: data.invoiceRequest,
                        }),
                    },
                    resultEvent._id,
                    { session }
                )
            }
        })
    } finally {
        await session.endSession()
    }
}

export const deleteInvoiceService = async (userId: ObjectId, customerId: ObjectId, caseId: ObjectId, invoiceId: ObjectId) => {
    const session = db.client.startSession()

    try{
        return await session.withTransaction(async () => {
            await db.collection<types.Invoice>("invoices").deleteOne(
                {
                    _id: invoiceId,
                    userId,
                    customerId,
                    caseId,
                },
                { session }
            )

            await db.collection<types.Transaction>("transactions").deleteMany(
                {
                    userId,
                    customerId,
                    caseId,
                    invoiceId
                },
                { session }
            )
            await db.collection("calendar-events").deleteMany(
                {
                    userId,
                    relatedInvoice: invoiceId,
                    relatedCustomer: customerId,
                },
                { session }
            )
        })
    } finally {
        await session.endSession()
    }
}