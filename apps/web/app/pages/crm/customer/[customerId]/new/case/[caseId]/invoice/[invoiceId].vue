<script setup lang="ts">
import '~/assets/css/pages/id.css'
import {useCustomerStore} from "~/store/customer";
import {API_ENDPOINTS} from "~/api/endpoints";
import type {Case, Transaction} from "~/types/types";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";

definePageMeta({
  layout: 'crm-layout'
})

const customerStore = useCustomerStore()
const caseData = ref<Case | null>(null)
const transaction = ref<Transaction[]>([])

const { customerId, caseId, invoiceId } = useRoute().params;

const sidebarLink = [
  {
    name: '案件に戻る',
    icon: 'md-keyboardreturn',
    to: `/crm/customer/${customerId}/new/case/${caseId}`
  },
  {
    name: '請求書',
    icon: 'md-eventrepeat',
    to: `/crm/customer/${customerId}/new/case/${caseId}/invoice/${invoiceId}`
  }
]

onMounted(async() => {
  await customerStore.loadCustomer(customerId)
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.detail(customerId, caseId), caseData)
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.invoices.transactions(customerId, caseId, invoiceId), transaction)
})
</script>

<template>
  <PageContainer :title="`${customerStore.customer?.companyName} - ${caseData?.caseName}`" :sidebar="sidebarLink">
    <h2></h2>
    <div class="section">
      <div class="content">
        <div class="table-container">
          <table class="table">
            <thead>
            <tr>
              <th class="sortable">
                製品名
              </th>
              <th class="sortable">
                金額
              </th>
              <th class="sortable">
                原価
              </th>
              <th class="sortable">
                税額
              </th>
              <th class="sortable">
                税率
              </th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="transact in transaction"
                :key="transact._id"
                class="table-row"
            >
              <td class="product">
                {{ transact.product }}
              </td>
              <td class="amount">
                {{ useFormat().formatCurrency(transact.amount) }}
              </td>
              <td>
                {{ useFormat().formatCurrency(transact.cost) }}
              </td>
              <td>
                {{ useFormat().formatCurrency(transact.taxInAmount) }}
              </td>
              <td>
                {{ transact.tax_rate }} %
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>

</style>