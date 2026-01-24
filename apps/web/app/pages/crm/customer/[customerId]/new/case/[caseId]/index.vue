<script setup lang="ts">
import {ref} from "vue";
import { useToast } from 'vue-toastification'
import {fetchCustomer} from "~/api/customer";
import {fetchTransactions} from "~/api/transactions";
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchInvoice} from "~/api/invoice";
import '~/assets/css/pages/id.css'
import type {Customer, Case, Invoice} from "~/types/types";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";
import Invoices from "~/pages/crm/customer/[customerId]/new/case/[caseId]/invoices.vue";
import {useCustomerStore} from "~/store/customer";

definePageMeta({
  layout: 'crm-layout'
})

const caseData = ref<Case | null>(null)
const invoices = ref<Invoice[]>([])
const customerStore = useCustomerStore()

const { customerId, caseId } = useRoute().params;

const sidebarLink = [
  {
    name: '案件一覧に戻る',
    icon: 'md-keyboardreturn',
    to: `/crm/customer/${customerId}/new/cases`
  },
  {
    name: '案件内容',
    icon: 'md-info',
    to: `/crm/customer/${customerId}/new/case/${caseId}`
  },
  {
    name: '請求書',
    icon: 'md-eventrepeat',
    to: `/crm/customer/${customerId}/new/case/${caseId}/invoices`
  },
]
async function loadCase() {
  try {
    caseData.value = await fetchData().fetch(API_ENDPOINTS.customers.cases.detail(customerId, caseId))
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await customerStore.loadCustomer(customerId)
  await loadCase()
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.invoices.list(customerId, caseId), invoices)
})

</script>

<template>
  <div>
    <PageContainer :title="`${customerStore.customer?.companyName} - ${caseData?.caseName}`" :sidebar="sidebarLink">
      <h2>案件内容</h2>
      <div class="section">
        <div class="content">
          <div class="field-row">
            <p class="field-label">案件タイトル</p>
            <p class="field-value">{{ caseData?.caseName }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">案件詳細</p>
            <p class="field-value">{{ caseData?.caseDescription }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">カテゴリー</p>
            <p class="field-value">{{ caseData?.category }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">案件予定開始日</p>
            <p class="field-value">{{ caseData?.caseStartDate }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">案件予定終了日</p>
            <p class="field-value">{{ caseData?.caseFinishDate }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">金額</p>
            <p class="field-value">{{ caseData?.amount }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">請求サイクル</p>
            <p class="field-value">{{ caseData?.billingCycle }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">ステータス</p>
            <p class="field-value">{{ caseData?.status }}</p>
          </div>
        </div>
      </div>
      <h2>最新の請求書</h2>
      <div class="section">
        <div class="table-container">
          <table class="table">
            <thead>
            <tr>
              <th class="sortable">
                請求書番号
              </th>
              <th class="sortable">
                合計金額
              </th>
              <th class="sortable">
                日付
              </th>
              <th class="sortable">
                ステータス
              </th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="invoice in invoices.slice(0, 5)"
                :key="invoice._id"
                class="table-row"
            >
              <td class="product">
                <NuxtLink :to="`/crm/customer/${customerId}/new/case/${caseId}/invoice/${invoice._id}`" class="invoiceLink">
                  {{ invoice.invoiceNumber }}
                </NuxtLink>
              </td>
              <td class="amount">
                {{ useFormat().formatCurrency(invoice.totalAmount) }}
              </td>
              <td>
                {{ invoice.invoiceRequest }}
              </td>
              <td>
                {{ invoice.invoiceStatus }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  </div>
</template>
