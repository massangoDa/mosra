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
    cost: number;
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
    startTime: string;
    endTime: string;
    allDay: boolean;
    color: string;
    relatedInvoice: string;
    relatedCustomer: string;
}