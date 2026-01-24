<script setup lang="ts">
import '~/assets/css/pages/id.css'
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";
import type {Customer, Invoice} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";
import {useCustomerStore} from "~/store/customer";

definePageMeta({
  layout: 'crm-layout'
})

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

const invoiceFields = [
  {
    name: 'invoiceNumber',
    label: '請求書番号',
    type: 'text',
    placeholder: 'INV-2025-001',
    required: true,
  },
  {
    name: 'invoiceRequest',
    label: '発行日',
    type: 'date',
    placeholder: 'YYYY/MM/DD',
    format: 'YYYY/MM/DD',
  },
  {
    name: 'invoiceStatus',
    label: 'ステータス',
    type: 'select',
    options: ['完了', '取引中', '未払い']
  },
]

const showInvoiceModal = ref(false);
const invoiceFormData = ref({});

onMounted(async () => {
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.invoices.list(customerId, caseId), invoices)
  await customerStore.loadCustomer(customerId)
})

</script>

<template>
  <div>
    <PageContainer :title="`${customerStore.customer?.companyName}`" :sidebar="sidebarLink">
      <template #header-right>
        <button @click="showInvoiceModal = true" class="NewInfoButton">
          + 請求書作成
        </button>
      </template>

      <h2>請求書</h2>
      <div class="section">
        <div class="content">
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
                  v-for="invoice in invoices"
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
      </div>
    </PageContainer>
  </div>

  <Modal
      v-if="showInvoiceModal"
      title="請求書追加"
      section-title="請求情報を追加"
      :submit-url="NEW_API_ENDPOINTS.customers.cases.invoices.create(customerId, caseId)"
      :fields="invoiceFields"
      v-model:form-data="invoiceFormData"
      success-message="請求書を保存しました"
      @close-modal="showInvoiceModal = false"
      @refresh=""
    />
</template>

<style scoped>

</style>