import { db } from '../utils/db.js'
import type { ObjectId } from 'mongodb'
import * as types from '../types/types.js'

export const getContactsService = async (userId: ObjectId) => {
    return await db.collection("contacts").find(
        {
            userId: userId,
        }
    ).sort({ createdAt: -1  }).toArray();
}

export const createContactService = async (userId: ObjectId, data: types.InputContact) => {
    return await db.collection<types.CreateContact>("contacts").insertOne(
        {
            userId: userId,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    )
}

export const getContactService = async (userId: ObjectId, contactId: ObjectId) => {
    return await db.collection<types.Contact>("contacts").findOne(
        {
            _id: contactId,
            userId: userId,
        }
    )
}

export const updateContactService = async (userId: ObjectId, contactId: ObjectId, data: types.InputContact) => {
    return await db.collection<types.Contact>("contacts").findOneAndUpdate(
        {
            _id: contactId,
            userId: userId,
        },
        {
            $set: {
                ...data,
                updatedAt: new Date(),
            }
        }
    )
}

export const deleteContactService = async (userId: ObjectId, contactId: ObjectId) => {
    return await db.collection<types.Contact>("contacts").deleteOne(
        {
            _id: contactId,
            userId: userId,
        }
    )
}