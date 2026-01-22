<script setup lang="ts">
import '~/assets/css/pages/id.css'

definePageMeta({
  layout: 'crm-layout'
})

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

const showInvoiceModal = ref(false);
</script>

<template>
  <div>
    <PageContainer title="顧客管理" :sidebar="sidebarLink">
      <template #header-right>
        <button @click="showInvoiceModal = true" class="NewInfoButton">
          + 請求書作成
        </button>
      </template>

      <h2>請求書</h2>
      <div class="section">
        <div class="content">

        </div>
      </div>
    </PageContainer>
  </div>

  <Modal
      v-if="showInvoiceModal"
      title="請求書追加"
      section-title="請求情報を追加"
    />
</template>

<style scoped>

</style>