import type { ObjectId } from 'mongodb'
import type { ParamsDictionary } from 'express-serve-static-core'
import { InputCaseSchema, InputContactSchema, InputCustomerSchema, InputInvoiceSchema, InputTransactionSchema } from '../schema/input.schema.js'
import * as z from "zod"

export interface AppParams extends ParamsDictionary {
    customerId?: string
    caseId?: string
    invoiceId?: string
    transactionId?: string
    contactId?: string
}

export interface ServiceParams {
    userId: ObjectId
    customerId: ObjectId
    caseId: ObjectId
    invoiceId: ObjectId
    transactionId: ObjectId
}

export interface User {
    email: string
    password: string
    name: string
    icon: string
    createdAt: Date
    updatedAt: Date
}

export interface LoginHistory {
    userId: ObjectId
    loginTime: Date
    ipAddress: string | undefined
    device: string
}

export type InputCustomer = z.infer<typeof InputCustomerSchema>

export interface CreateCustomer extends InputCustomer {
    userId: ObjectId
    createdAt: Date
    updatedAt: Date
}

export interface Customer extends CreateCustomer {
    _id: ObjectId
}

export type InputCase = z.infer<typeof InputCaseSchema>

export interface CreateCase extends InputCase {
    userId: ObjectId
    customerId: ObjectId
    createdAt: Date
    updatedAt: Date
}

export interface Case extends CreateCase {
    _id: ObjectId
}

export type InputInvoice = z.infer<typeof InputInvoiceSchema>

export interface CreateInvoice extends InputInvoice {
    userId: ObjectId
    customerId: ObjectId
    caseId: ObjectId
    createdAt: Date
    updatedAt: Date
}

export interface Invoice extends CreateInvoice {
    _id: ObjectId
}

export type InputTransaction = z.infer<typeof InputTransactionSchema>

export interface CreateTransaction extends InputTransaction {
    userId: ObjectId
    customerId: ObjectId
    caseId: ObjectId
    invoiceId: ObjectId
    createdAt: Date
    updatedAt: Date
}

export interface Transaction extends InputTransaction {
    _id: ObjectId
}

export type InputContact = z.infer<typeof InputContactSchema>

export interface CreateContact extends InputContact {
    userId: ObjectId
    createdAt: Date
    updatedAt: Date
}

export interface Contact extends CreateContact {
    _id: ObjectId
}






export interface InputCalendarEvent {
    userId: ObjectId
    title: string
    description?: string
    date?: string | Date
    startTime?: string | Date
    endTime?: string | Date
    allDay?: boolean
    category?: string
    color?: string
    relatedInvoice?: ObjectId | null
    relatedCustomer?: ObjectId | null
    status?: string
    location?: string
    createdAt?: Date
    updatedAt?: Date
}
