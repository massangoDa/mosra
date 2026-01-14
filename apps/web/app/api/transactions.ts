import type {Transaction} from "~/types/types";

export async function fetchTransactions(customerId: string, invoiceId: string): Promise<Transaction> {
    return await fetchData().fetch(`/api/customers/${customerId}/invoices/${invoiceId}/transactions`)
}