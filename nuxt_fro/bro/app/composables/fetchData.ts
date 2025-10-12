export const fetchData = () => {

    const fetch = async (url: string, method: string) => {
        if (!method) {
            method = 'GET';
        }

        return await $fetch(`${url}`, {
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