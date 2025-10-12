// 型定義は全てこの中へ(多くなればファイル分けします)
export interface Customer {
    _id: string;
    companyName: string;
    type?: string;
    category?: string;
    website?: string;
    phone?: string;
    description?: string;
    totalAmount?: number;
}

export interface Transaction {
    _id: string;
    product: string;
    amount: number;
    taxInAmount: number;
    totalAmount: number;
    cost: number;
    tax_rate: number;
}

export interface Invoice {
    _id: string;
    customerId: string;
    invoiceNumber: string;
    totalAmount: number;
    invoiceRequest: string;
    invoiceStatus: string;
}

export interface Calendar {
    _id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
    category: string;
    color: string;
    relatedInvoice: string;
    relatedCustomer: string;
    status: string;
}