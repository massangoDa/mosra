// 型定義は全てこの中へ(多くなればファイル分けします)
export interface Customer {
    _id: string;
    companyName: string;
    type?: string;
    category?: string;
    website?: string;
    phone?: string;
    description?: string;
}

export interface Transaction {
    _id: string;
    product: string;
    amount: number;
    cost: number;
}

export interface Invoice {
    invoiceNumber: string;
    totalAmount: number;
    invoiceRequest: string;
    invoiceStatus: string;
    _id: string;
}