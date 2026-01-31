import { defineStore } from 'pinia'

export const useIdStore = defineStore('idStore', () => {
    const customerId = ref<string | null>(null)
    const invoiceId = ref<string | null>(null)
    const transactionId = ref<string | null>(null)

    function setCustomer(id: string) {
        customerId.value = id
    }

    function setInvoice(id: string) {
        invoiceId.value = id
    }

    function setTransaction(id: string) {
        transactionId.value = id
    }

    return {
        customerId,
        invoiceId,
        transactionId,
        setCustomer,
        setInvoice,
        setTransaction,
    }
})