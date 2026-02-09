import { ObjectId } from 'mongodb'
import { db } from '../utils/db.js'
import * as types from '../types/types.js'
import { createCalendarEvent } from '../utils/manageCalendarEvent.js'

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

            if (!result.insertedId) {
                throw new Error('INVOICE_CREATE_FAILED')
            }
            await createCalendarEvent(
                {
                    userId: userId,
                    title: `請求書: ${data.invoiceNumber}`,
                    date: data.invoiceRequest,
                    startTime: data.invoiceRequest,
                    endTime: data.invoiceRequest,
                    allDay: true,
                    category: 'invoice',
                    color: '#fbbf24',
                    relatedInvoice: result.insertedId,
                    relatedCustomer: customerId,
                    status: data.invoiceStatus,
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
