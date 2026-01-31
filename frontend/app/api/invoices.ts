import {API_ENDPOINTS} from "~/api/endpoints";
import type {Invoice} from "~/types/types";

export async function fetchInvoices(customerId: string): Promise<Invoice> {
    return await fetchData().fetch(API_ENDPOINTS.customers.invoices.list(customerId))
}