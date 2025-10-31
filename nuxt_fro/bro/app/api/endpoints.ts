export const API_ENDPOINTS = {
    dashboard: '/api/dashboard',
    allInvoices: () => `/api/invoices`,
    calendarEvents: () => `/api/calendar-events`,
    createCalendarEvent: () => `/api/calendar-events`,

    // アカウント関連
    accounts: {
        update: '/api/accounts/user',
        loginHistory: '/api/accounts/loginHistory',
    },

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
    },

    // 検索関連
    search: {
        companyName: (customerId: string) => `/api/search/customer/${customerId}/companyName`,
        transactions: (query: string) => `/api/search/customers/transactions?q=${query}`,
        lastNameFirstName: (contactId: string) => `/api/search/contact/${contactId}/lastNameFirstName`,
    },

    // コメント機能関連
    comments: {
        create: (customerId: string) => `/api/customers/${customerId}/comments`,
        list: (customerId: string) => `/api/customers/${customerId}/comments`,
    },

    // 連絡先関連
    contacts: {
        create: '/api/contacts',
        list:'/api/contacts',
        update: (contactId: string) => `/api/contacts/${contactId}`,
        delete: (contactId: string) => `/api/contacts/${contactId}`,
    }
}