import * as z from "zod"
import { zDate, zNumber, zString } from '../utils/zod.js'
import { ObjectId } from 'mongodb'

export const InputCustomerSchema = z.object({
    companyName: z.string().min(1),
    type: zString(),
    category: zString(),
    website: zString(),
    phone: zString(),
    description: zString(),
    contactId: zString().transform(val => val ? new ObjectId(val) : null),
})

export const InputCaseSchema = z.object({
    caseName: z.string().min(1),
    caseDescription: zString(),
    category: zString(),
    caseStartDate: zDate(),
    caseFinishDate: zDate(),
    amount: zNumber(),
    billingCycle: zString(),
    status: zString(),
})

export const InputInvoiceSchema = z.object({
    invoiceNumber: z.string().min(1),
    totalAmount: zNumber(),
    invoiceRequest: zString(),
    invoiceStatus: zString(),
})

export const InputTransactionSchema = z.object({
    product: z.string().min(1),
    amount: zNumber(),
    cost: zNumber(),
    tax_rate: zNumber(),
})

export const InputContactSchema = z.object({
    lastName: z.string().min(1),
    firstName: zString(),
    customerId: zString().transform(val => val ? new ObjectId(val) : null),
    email: zString(),
    phone: zString(),
    notes: zString(),
})