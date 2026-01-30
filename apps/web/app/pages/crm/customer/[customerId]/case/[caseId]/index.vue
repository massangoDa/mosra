<script setup lang="ts">
import {ref} from "vue";
import { useToast } from 'vue-toastification'
import '~/assets/css/pages/id.css'
import type {Invoice} from "~/types/types";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";
import {useCustomerStore} from "~/store/customer";
import {useCaseStore} from "~/store/case";

definePageMeta({
  layout: 'crm-layout'
})

const invoices = ref<Invoice[]>([])

const customerStore = useCustomerStore()
const caseStore = useCaseStore()

const { customerId, caseId } = useRoute().params;

const sidebarLink = [
  {
    name: '案件一覧に戻る',
    icon: 'md-keyboardreturn',
    to: `/crm/customer/${customerId}/cases`
  },
  {
    name: '案件内容',
    icon: 'md-info',
    to: `/crm/customer/${customerId}/case/${caseId}`
  },
  {
    name: '請求書',
    icon: 'md-eventrepeat',
    to: `/crm/customer/${customerId}/case/${caseId}/invoices`
  },
]

onMounted(async () => {
  await customerStore.loadCustomer(customerId)
  await caseStore.loadCase(customerId, caseId)
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.invoices.list(customerId, caseId), invoices)
})

</script>

<template>
  <div>
    <PageContainer :title="`${customerStore.customer?.companyName} - ${caseStore.caseData?.caseName}`" :sidebar="sidebarLink">
      <h2>案件内容</h2>
      <div class="section">
        <div class="content">
          <div class="field-row">
            <p class="field-label">案件タイトル</p>
            <p class="field-value">{{ caseStore.caseData?.caseName }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">案件詳細</p>
            <p class="field-value">{{ caseStore.caseData?.caseDescription }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">カテゴリー</p>
            <p class="field-value">{{ caseStore.caseData?.category }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">案件予定開始日</p>
            <p class="field-value">{{ caseStore.caseData?.caseStartDate }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">案件予定終了日</p>
            <p class="field-value">{{ caseStore.caseData?.caseFinishDate }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">金額</p>
            <p class="field-value">{{ caseStore.caseData?.amount }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">請求サイクル</p>
            <p class="field-value">{{ caseStore.caseData?.billingCycle }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">ステータス</p>
            <p class="field-value">{{ caseStore.caseData?.status }}</p>
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
                <NuxtLink :to="`/crm/customer/${customerId}/case/${caseId}/invoice/${invoice._id}`" class="invoiceLink">
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
