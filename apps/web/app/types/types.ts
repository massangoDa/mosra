// 型定義は全てこの中へ(多くなればファイル分けします)
export interface Customer {
    _id: string;
    contactId?: string;
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

export interface Comment {
    _id: string;
    customerId: string;
    comment: string;
    name: string;
    createdAt: string;
}

export interface SearchResult {
    _id: string;
    customerId: string;
    invoiceId: string;
    product: string;
    amount: number;
}

export interface Contacts {
    _id: string;
    customerId: string;
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    notes: string;
}

export interface IdConfig {
    customerId: string;
    invoiceId: string;
    transactionId: string;
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'phone' | 'website' | 'textarea' | 'select' | 'date' | 'datetime'| 'color';
    placeholder?: string;
    required?: boolean;
    options?: (string | SelectOption)[];
    rows?: number;
    fullWidth?: boolean;
    templateButton?: string[];
}

export interface Form {
    name: string;
    label: string;
    type: 'text' | 'number' | 'phone' | 'website' | 'textarea' | 'select' | 'date' | 'datetime';
    placeholder?: string;
    options?: (string | SelectOption)[];
    required?: boolean;
}

export interface loginHistory {
    loginTime: string;
    ipAddress: string;
    device: string;
}

export interface Cases {
    _id: string;
    caseName: string;
    category: string;
    caseStartDate: string;
    caseFinishDate: string;
    monthlyFee: number;
    billingCycle: string;
}