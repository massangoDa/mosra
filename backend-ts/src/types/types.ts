import type {ObjectId} from "mongodb";

export interface User {
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

export interface InputCustomer {
    companyName: string;
    type?: string;
    category?: string;
    website?: string;
    phone?: string;
    description?: string;
    contactId?: ObjectId | null;
}

export interface CreateCustomer extends InputCustomer {
    userId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface Customer extends CreateCustomer {
    _id: ObjectId;
}

export interface InputCase {
    caseName: string;
    caseDescription: string;
    category: string;
    caseStartDate: Date;
    caseFinishDate: Date;
    amount: number;
    billingCycle: string;
    status: string;
}

export interface CreateCase extends InputCase {
    userId: ObjectId;
    customerId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface Case extends CreateCase {
    _id: ObjectId;
}

export interface InputInvoice {
    invoiceNumber: string;
    totalAmount: number;
    invoiceRequest: string;
    invoiceStatus: string;
}

export interface CreateInvoice extends InputInvoice {
    userId: ObjectId;
    customerId: ObjectId;
    caseId: ObjectId;
    createdAt: Date;
    updatedAt: Date
}

export interface InputCalendarEvent {
    userId: ObjectId;
    title: string;
    description?: string;
    date: string | Date;
    startTime: string | Date;
    endTime?: string | Date;
    allDay?: boolean;
    category?: string;
    color?: string;
    relatedInvoice?: ObjectId | null;
    relatedCustomer?: ObjectId | null;
    status?: string;
    location?: string;
    createdAt?: Date;
    updatedAt?: Date;
}