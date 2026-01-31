import type {Case} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";

export async function fetchCase(customerId: string): Promise<Case[]> {
    return await fetchData().fetch(API_ENDPOINTS.customers.cases.list(customerId))
}