import type {Case} from "~/types/types";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";

export const useCaseStore = defineStore('case', () => {
    const currentCase = ref<Case | null>(null)
    const currentCaseId = ref<string | null>(null)
    const currentCustomerId = ref<string | null>(null)

    const caseData = computed(() => currentCase.value)

    async function loadCase(customerId: string, caseId: string, force = false) {
        if (!force && currentCaseId.value === caseId && currentCase.value && currentCustomerId.value === customerId) {
            return currentCase.value
        }

        const data = await fetchData().fetch(NEW_API_ENDPOINTS.customers.cases.detail(customerId, caseId))
        currentCaseId.value = caseId
        currentCase.value = data
        return data
    }

    return { currentCase, caseData, loadCase }
})