export const NEW_API_ENDPOINTS = {
    customers: {
        detail: (customerId: string) => `/api/customers/${customerId}`,
        update: (customerId: string) => `/api/customers/${customerId}`,
        cases: {
            list: (customerId: string) => `/api/customers/${customerId}/cases`,
            create: (customerId: string) => `/api/customers/${customerId}/cases`,
            detail: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}`,
            update: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}`,
            delete: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}`,
            invoices: {
                list: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices`,
                create: (customerId: string, caseId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices`,
                transactions: {
                    list: (customerId: string, caseId: string, invoiceId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices/${invoiceId}/transactions`,
                    create: (customerId: string, caseId: string, invoiceId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices/${invoiceId}/transactions`,
                    update: (customerId: string, caseId: string, invoiceId: string, transactionId: string) => `/api/customers/${customerId}/cases/${caseId}/invoices/${invoiceId}/transactions/${transactionId}`
                }
            }
        }
    },
    contacts: {
        list: `/api/contacts`,
        create: `/api/contacts`,
        detail: (contactId: string) => `/api/contacts/${contactId}`,
        delete: (contactId: string) => `/api/contacts/${contactId}`,
        update: (contactId: string) => `/api/contacts/${contactId}`
    },
    search: {
        companyName: (customerId: string) => `/api/search/customer/${customerId}/companyName`
    }
}