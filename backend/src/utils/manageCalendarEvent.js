import {ObjectId} from "mongodb";
import {db} from "../db.js";

export const manageCalendarEvent = async (eventData, eventId = null) => {
    try {
        // 更新の場合
        if (eventId) {
            const updateFields = {};

            // 渡されたフィールドだけを更新対象に追加
            if (eventData.userId !== undefined) updateFields.userId = eventData.userId;
            if (eventData.title !== undefined) updateFields.title = eventData.title;
            if (eventData.description !== undefined) updateFields.description = eventData.description;
            if (eventData.date !== undefined) updateFields.date = new Date(eventData.date);
            if (eventData.startTime !== undefined) updateFields.startTime = new Date(eventData.startTime);
            if (eventData.endTime !== undefined) updateFields.endTime = new Date(eventData.endTime);
            if (eventData.allDay !== undefined) updateFields.allDay = eventData.allDay;
            if (eventData.category !== undefined) updateFields.category = eventData.category;
            if (eventData.color !== undefined) updateFields.color = eventData.color;
            if (eventData.relatedInvoice !== undefined) updateFields.relatedInvoice = eventData.relatedInvoice;
            if (eventData.relatedCustomer !== undefined) updateFields.relatedCustomer = eventData.relatedCustomer;
            if (eventData.status !== undefined) updateFields.status = eventData.status;
            if (eventData.location !== undefined) updateFields.location = eventData.location;

            updateFields.updatedAt = new Date();

            const result = await db.collection("calendar-events").updateOne(
                { _id: new ObjectId(eventId) },
                { $set: updateFields }
            );
            return { success: true, updated: true, modifiedCount: result.modifiedCount };
        }

        // 新規追加の場合(デフォルト値を設定)
        const calendarEvent = {
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
        };

        const result = await db.collection("calendar-events").insertOne(calendarEvent);
        return { success: true, updated: false, eventId: result.insertedId };
    } catch (error) {
        console.log("カレンダーイベントの操作エラー", error);
        throw error;
    }
}