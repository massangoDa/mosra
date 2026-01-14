import type {Customer} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";

export async function fetchCustomers(): Promise<Customer[]> {
    return await fetchData().fetch(API_ENDPOINTS.customers.list);
}