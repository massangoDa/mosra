export function useDataLoader() {
    async function loadData<T>(url: string, target: Ref<T | null>) {
        try {
            target.value = await fetchData().fetch(url)
        } catch (error) {
            console.error(error)
        }
    }

    return { loadData }
}