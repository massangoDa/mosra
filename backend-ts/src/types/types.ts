import type {ObjectId} from "mongodb";

export interface User {
    id?: string;
    email: string;
    password: string;
    name: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginHistory {
    userId: ObjectId;
    loginTime: Date;
    ipAddress: string | undefined;
    device: string;
}

export interface Customer {
    _id?: ObjectId;
    userId: ObjectId;
    companyName: string;
    type?: string;
    category?: string;
    website?: string;
    phone?: string;
    description?: string;
    contactId?: ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}