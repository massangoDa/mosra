import type {Customer} from "~/types/types";

export async function fetchCustomer(customerId: string): Promise<Customer> {
    return await fetchData().fetch(`/api/customer/${customerId}`)
}