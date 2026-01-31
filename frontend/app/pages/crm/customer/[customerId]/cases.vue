<script setup lang="ts">
import {ref} from "vue";
import type {Customer, Case} from "~/types/types";
import {fetchCustomer} from "~/api/customer";
import '~/assets/css/pages/id.css'
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchCase} from "~/api/cases";
import {useCustomerStore} from "~/store/customer";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";

definePageMeta({
  layout: 'crm-layout'
})

const customer = ref<Customer | null>(null)
const caseData = ref<Case[] | null>(null)
const customerStore = useCustomerStore()

const { customerId } = useRoute().params;

const sidebarLink = [
  {
    name: '顧客一覧に戻る',
    icon: 'md-keyboardreturn',
    to: `/crm/customerInf/`
  },
  {
    name: '案件',
    icon: 'md-viewkanban',
    to: `/crm/customer/${customerId}/cases`
  },
  {
    name: '詳細',
    icon: 'md-info',
    to: `/crm/customer/${customerId}/details`
  }
]

onMounted(async () => {
  await customerStore.loadCustomer(customerId)
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.list(customerId), caseData)
})

const showCaseModal = ref(false)

const caseFormData = reactive({
  category: '',
  billingCycle: ''
})

const caseFields = computed(() => [
  {
    name: 'caseName',
    label: '案件名',
    type: 'text',
    required: true
  },
  {
    name: 'caseDescription',
    label: '案件概要',
    type: 'textarea',
  },
  {
    name: 'category',
    label: '区分',
    type: 'select',
    options: ['保守', '単発', 'その他'],
  },
  {
    name: 'caseStartDate',
    label: '予定開始日',
    type: 'date',
    format: 'YYYY/MM/DD',
    required: true
  },
  {
    name: 'caseFinishDate',
    label: '予定終了日',
    type: 'date',
    format: 'YYYY/MM/DD',
  },
  {
    name: 'amount',
    label: caseFormData.category === '単発'
        ? '金額（総額）'
        : '金額（月額）',
    type: 'number',
  },
  {
    name: 'billingCycle',
    label: '請求サイクル',
    type: 'select',
    options: caseFormData.category === '単発'
      ? ['一回のみ']
      :['毎月', '2ヶ月毎', '年1回', '一回のみ'],
  },
  {
    name: 'status',
    label: 'ステータス',
    type: 'select',
    options: ['見積中', '進行中', '停止', '完了'],
  }
])

watch(() => caseFormData.category, (newVal) => {
  if (newVal === '単発') {
    caseFormData.billingCycle = '一回のみ'
  }
})

</script>

<template>
<div>
  <PageContainer :title="customerStore.customer?.companyName" :sidebar="sidebarLink">
    <template #header-right>
      <button @click="showCaseModal = true" class="NewInfoButton">+ 案件追加</button>
    </template>
    <h2>案件</h2>
    <div class="section">
      <NuxtLink
          v-for="caseItem in caseData"
          :key="caseItem._id"
          :to="`/crm/customer/${customerId}/case/${caseItem._id}`"
          class="section case-link"
      >
        <p>{{ caseItem.caseName }}</p>
        <p>{{ caseItem.caseDescription }}</p>
        <p>{{ caseItem.category }}</p>
        <p>{{ caseItem.amount }}</p>
      </NuxtLink>
    </div>
  </PageContainer>
  <Modal
      v-if="showCaseModal"
      v-model:form-data="caseFormData"
      title="案件追加"
      section-title="案件を追加"
      :submit-url="NEW_API_ENDPOINTS.customers.cases.create(customerId)"
      :fields="caseFields"
      success-message="案件を保存しました"
      @close-modal="showCaseModal = false"
      @refresh=""
  />
</div>
</template>

<style scoped>

</style>