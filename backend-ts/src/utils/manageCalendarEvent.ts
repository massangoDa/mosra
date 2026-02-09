import { ObjectId, ClientSession } from 'mongodb'
import { db } from './db.js'
import * as types from '../types/types.js'

export const createCalendarEvent = async (eventData: types.InputCalendarEvent, options?: { session?: ClientSession }) => {
    try {
        const calendarEvent: types.InputCalendarEvent = {
            userId: eventData.userId,
            title: eventData.title,
            description: eventData.description || '',
            date: new Date(eventData.date),
            startTime: new Date(eventData.startTime),
            endTime: eventData.endTime ? new Date(eventData.endTime) : new Date(eventData.startTime),
            allDay: eventData.allDay !== undefined ? eventData.allDay : false,
            category: eventData.category || 'other',
            color: eventData.color || '#3b82f6',
            relatedInvoice: eventData.relatedInvoice || null,
            relatedCustomer: eventData.relatedCustomer || null,
            status: eventData.status || 'pending',
            location: eventData.location || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const result = await db.collection('calendar-events').insertOne(calendarEvent, options?.session ? { session: options.session } : {})

        return { eventId: result.insertedId }
    } catch (error) {
        console.log('カレンダーイベントの操作エラー', error)
        throw error
    }
}
