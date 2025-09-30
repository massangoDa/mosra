// このコードは、ご覧のスポンサーの提供でお送りします
///// MASSANGO /////
import type {Customer} from "~/types/types";

export async function fetchCustomers(): Promise<Customer[]> {
    return await fetchData().fetch(`/api/customers`);
}