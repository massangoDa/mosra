export const fetchData = () => {

    const fetch = async (url: string, method: string = 'GET', body?: any) => {
        const options: any = {
            method: method,
            headers: {
                Authorization: `Bearer ${useAuth().authToken.value}`,
            }
        }

        // bodyがある場合のみ追加
        if (body) {
            options.body = JSON.stringify(body)
        }

        return await $fetch(url, options)
    }

    return {
        fetch,
    }
}