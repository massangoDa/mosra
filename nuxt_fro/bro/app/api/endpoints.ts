export const API_ENDPOINTS = {
    dashboard: '/api/dashboard',

    // 顧客関連
    customers: {
        create: '/api/customers',
        list: '/api/customers',
        detail: (customerId: string) => `/api/customers/${customerId}`,
        delete: (customerId: string) => `/api/customers/${customerId}`,
        update: (customerId: string) => `/api/customers/${customerId}`,

        // 取引関連
        transactions: {
            create: (customerId: string) => `/api/customers/${customerId}/transactions`,
            list: (customerId: string) => `/api/customers/${customerId}/transactions`, // 現在は不使用だが、一覧を表示する時のため
        },

        // 請求書関連
        invoices: {
            create: (customerId: string) => `/api/customers/${customerId}/invoices`,
            list: (customerId: string) => `/api/customers/${customerId}/invoices`,
            detail: (customerId: string, invoiceId: string) => `/api/customers/${customerId}/invoices/${invoiceId}`,
            update: (customerId: string, invoiceId: string) => `/api/customers/${customerId}/invoices/${invoiceId}`,
            delete: (customerId: string, invoiceId: string) => `/api/customers/${customerId}/invoices/${invoiceId}`,
            transactions: (customerId: string, invoiceId: string) => `/api/customers/${customerId}/invoices/${invoiceId}/transactions`,
            transactionDetail: (customerId: string, invoiceId: string, transactionId: string) => `/api/customers/${customerId}/invoices/${invoiceId}/transactions/${transactionId}`,
            transactionUpdate: (customerId: string, invoiceId: string, transactionId: string) => `/api/customers/${customerId}/invoices/${invoiceId}/transactions/${transactionId}`,
            transactionDelete: (customerId: string, invoiceId: string, transactionId: string) => `/api/customers/${customerId}/invoices/${invoiceId}/transactions/${transactionId}`,
        }
    }
}