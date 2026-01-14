export const useFormat = () => {
    const addComma = (value) => {
        if (!value && value !== 0) return ''
        return Number(value).toLocaleString()
    }

    const formatCurrency = (value, currency = '円') => {
        if (!value && value !== 0) return ''
        return Number(value).toLocaleString() + currency
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}年${month}月${day}日`;
    };


    return {
        addComma,
        formatCurrency,
        formatDate,
    }
}