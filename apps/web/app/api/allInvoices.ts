import {API_ENDPOINTS} from "~/api/endpoints";
import type {Invoice} from "~/types/types";

export async function fetchAllInvoices(): Promise<Invoice> {
    return await fetchData().fetch(API_ENDPOINTS.allInvoices())
}