export const useFormat = () => {
    const addComma = (value) => {
        if (!value && value !== 0) return ''
        return Number(value).toLocaleString()
    }

    const formatCurrency = (value, currency = '円') => {
        if (!value && value !== 0) return ''
        return Number(value).toLocaleString() + currency
    }

    return {
        addComma,
        formatCurrency
    }
}