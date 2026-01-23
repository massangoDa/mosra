export const useDataLoader = () => {

    const loadData = async <T>(url: string, ref: Ref<T[]>) => {
        try {
            ref.value = await fetchData().fetch(url, 'GET');
        } catch (error) {
            console.log(error);
        }
    }

    return {
        loadData,
    }
}
