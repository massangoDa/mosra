<script setup lang="ts">
import {ref} from "vue";
import { useToast } from 'vue-toastification'
import {fetchCustomer} from "~/api/customer";
import {fetchTransactions} from "~/api/transactions";
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchInvoice} from "~/api/invoice";
import '~/assets/css/pages/id.css'
import type {Customer, Cases} from "~/types/types";

definePageMeta({
  layout: 'crm-layout'
})

const customer = ref<Customer | null>(null)
const caseData = ref<Cases | null>(null)

const { customerId, caseId } = useRoute().params;

const sidebarLink = [
  {
    name: '案件',
    icon: 'md-viewkanban',
    to: `/crm/customer/${customerId}/new/cases`
  },
  {
    name: 'サブスクリプション',
    icon: 'md-eventrepeat',
    to: `/crm/customer/${customerId}/new/subscription`
  },
  {
    name: '詳細',
    icon: 'md-info',
    to: `/crm/customer/${customerId}/new/details`
  }
]

async function loadCustomer() {
  try {
    customer.value = await fetchCustomer(customerId)
  } catch (error) {
    console.error(error);
  }
}
async function loadCase() {
  try {
    caseData.value = await fetchData().fetch(API_ENDPOINTS.customers.cases.detail(customerId, caseId))
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await loadCustomer()
  await loadCase()
})

</script>

<template>
  <div>
    <PageContainer :title="`${customer?.companyName} - ${caseData?.caseName}`" :sidebar="sidebarLink">
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

      </div>
    </PageContainer>
  </div>
</template>
