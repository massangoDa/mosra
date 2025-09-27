export const fetchData = () => {
    // いつかproxyする
    const BASE_URL = 'http://localhost:5000';

    const fetch = async (url: string, method: string) => {
        if (!method) {
            method = 'GET';
        }

        return await $fetch(`${BASE_URL}${url}`, {
            method: method,
            headers: {
                Authorization: `Bearer ${useAuth().authToken.value}`,
            }
        })
    }

    return {
        fetch,
    }
}