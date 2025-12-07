<script setup lang="ts">
import {ref} from "vue";
import type {Customer} from "~/types/types";
import {fetchCustomer} from "~/api/customer";

definePageMeta({
  layout: 'crm-layout'
})

const customer = ref<Customer | null>(null)

const { customerId } = useRoute().params;

const sidebarLink = [
  {
    name: '案件',
    icon: 'md-lock',
    to: `/crm/customer/${customerId}/new/case`
  },
  {
    name: 'サブスクリプション',
    icon: 'md-lock',
    to: `/crm/customer/${customerId}/new/subscription`
  },
  {
    name: '詳細',
    icon: 'md-lock',
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

onMounted(async () => {
  await loadCustomer()
})

const showCaseModal = ref(false)

const submitCaseUrl = ``

const caseFields = [
  {
    name: 'caseName',
    label: '案件名',
    type: 'text',
  },
  {
    name: 'category',
    label: '区分',
    type: 'select',
    options: ['保守', '単発', 'その他'],
  },
  {
    name: 'caseStartDate',
    label: '契約開始日',
    type: 'date',
    format: 'YYYY/MM/DD',
  },
  {
    name: 'caseFinishDate',
    label: '契約終了日',
    type: 'date',
    format: 'YYYY/MM/DD',
  },
  {
    name: 'monthlyFee',
    label: '金額',
    type: 'number',
  },
  {
    name: 'billingCycle',
    label: '請求サイクル',
    type: 'select',
    options: ['毎月', '2ヶ月毎', '年1回', '一回のみ'],
  }
]

</script>

<template>
<div>
  <PageContainer :title="customer?.companyName" :sidebar="sidebarLink">
    <template #header-right>
      <button @click="showCaseModal = true" class="NewInfoButton">+ 請求書追加</button>
    </template>
    <h2>案件</h2>
  </PageContainer>
  <TemplateModal
      v-if="showCaseModal"
      title="案件追加"
      section-title="請求書を追加"
      :submit-url="submitCaseUrl"
      :fields="caseFields"
      success-message="請求書を保存しました"
      @close-modal="showCaseModal = false"
      description="区分を『<span style='color:#d9534f; font-weight:bold;'>単発</span>』にしたときは、金額にそのまま請求額を入力し、請求サイクルには『<span style='color:#0275d8; font-weight:bold;'>1回のみ</span>』を選んでください。"

      @refresh=""
  />
</div>
</template>

<style scoped>

</style>