import type { ObjectId } from 'mongodb'
import { db } from '../utils/db.js'
import * as types from "../types/types.js"

export const searchCompanyNameService = async (userId: ObjectId, customerId: ObjectId) => {
    return await db.collection<types.Customer>("customers").findOne(
        {
            _id: customerId,
            userId: userId,
        },
        {
            projection: { companyName: 1 }
        }
    )
}