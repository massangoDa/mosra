import type {Customer} from "~/types/types";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";

export const useCustomerStore = defineStore('customer', () => {
    const currentCustomer = ref<Customer | null>(null)
    const currentCustomerId = ref<string | null>(null)

    const customer = computed(() => currentCustomer.value)

    async function loadCustomer(customerId: string, force = false) {
        if (!force && currentCustomerId.value === customerId && currentCustomer.value) {
            return currentCustomer.value
        }

        const data = await fetchData().fetch(NEW_API_ENDPOINTS.customers.detail(customerId))
        currentCustomerId.value = customerId
        currentCustomer.value = data
        return data
    }

    return { currentCustomer, customer, loadCustomer }
})