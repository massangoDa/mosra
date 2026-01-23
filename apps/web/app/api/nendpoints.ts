export const NEW_API_ENDPOINTS = {
    customers: {
        cases: {
            invoices: {
                create: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices`,
                list: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices`
            }
        }
    },
}