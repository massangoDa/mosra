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

</script>

<template>
<div>
  <PageContainer :title="customer?.companyName" :sidebar="sidebarLink">
    <h2>案件</h2>
  </PageContainer>
</div>
</template>

<style scoped>

</style>