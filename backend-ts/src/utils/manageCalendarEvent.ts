import { ObjectId, ClientSession } from 'mongodb'
import { db } from './db.js'
import * as types from '../types/types.js'

export const createCalendarEvent = async (eventData: types.InputCalendarEvent, options?: { session?: ClientSession }) => {
    try {
        const now = new Date()

        const calendarEvent: types.InputCalendarEvent = {
            userId: eventData.userId,
            title: eventData.title,
            description: eventData.description || '',
            date: eventData.date ? new Date(eventData.date) : now,
            startTime: eventData.startTime ? new Date(eventData.startTime) : now,
            endTime: eventData.endTime ? new Date(eventData.endTime) : eventData.startTime ? new Date(eventData.startTime) : now,
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

export const updateCalendarEvent = async (eventData: types.InputCalendarEvent, eventId: ObjectId, options?: { session?: ClientSession }) => {
    try {
        await db.collection("calendar-events").findOneAndUpdate(
            {
                _id: eventId,
                userId: eventData.userId,
            },
            {
                $set: {
                    ...eventData,
                    updatedAt: new Date(),
                }
            }
        )
    } catch (error) {
        console.log("カレンダーイベントの操作エラー", error);
        throw error;
    }
}