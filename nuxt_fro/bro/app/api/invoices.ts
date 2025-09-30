export interface Invoice {
    invoiceNumber: string;
    totalAmount: number;
    invoiceRequest: string;
    invoiceStatus: string;
    _id: string;
}

export async function fetchInvoices(customerId: string): Promise<Invoice> {
    return await fetchData().fetch(`/api/customer/${customerId}/invoices`)
}