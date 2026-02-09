import type { ObjectId } from 'mongodb'

export interface AuthUser {
    id: ObjectId
    email: string
    name: string
    icon: string
}
