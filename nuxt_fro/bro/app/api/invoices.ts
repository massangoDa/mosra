import {API_ENDPOINTS} from "~/api/endpoints";

export async function fetchInvoices(customerId: string): Promise<Invoice> {
    return await fetchData().fetch(API_ENDPOINTS.customers.invoices.list(customerId))
}