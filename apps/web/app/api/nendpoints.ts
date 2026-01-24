export const NEW_API_ENDPOINTS = {
    customers: {
        detail: (customerId: string) => `/api/customers/${customerId}`,
        cases: {
            create: (customerId: string) => `/api/customers/${customerId}/cases`,
            list: (customerId: string) => `/api/customers/${customerId}/cases`,
            detail: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}`,
            invoices: {
                create: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices`,
                list: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices`,
                transactions: (customerId: string, caseId: string, invoiceId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices/${invoiceId}/transactions`,
            }
        }
    },
}