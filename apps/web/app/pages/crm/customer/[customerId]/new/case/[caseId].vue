<script setup lang="ts">
import {ref} from "vue";
import { useToast } from 'vue-toastification'
import {fetchCustomer} from "~/api/customer";
import {fetchTransactions} from "~/api/transactions";
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchInvoice} from "~/api/invoice";
import '~/assets/css/pages/id.css'
import type {Customer} from "~/types/types";

definePageMeta({
  layout: 'crm-layout'
})

const customer = ref<Customer | null>(null)

const { customerId } = useRoute().params;

const sidebarLink = [
  {
    name: '案件',
    icon: 'md-lock',
    to: `/crm/customer/${customerId}/new/cases`
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

</script>

<template>
  <div>
    <PageContainer :title="customer?.companyName" :sidebar="sidebarLink">
    </PageContainer>
  </div>
</template>
