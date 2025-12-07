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
      <h2>詳細</h2>
      <div class="section">
        <div class="content">
          <div class="field-row">
            <p class="field-label">取引先名</p>
            <p class="field-value">{{ customer?.companyName }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">種別</p>
            <p class="field-value">{{ customer?.type }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">カテゴリー</p>
            <p class="field-value">{{ customer?.category }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">Webサイト</p>
            <a class="field-value-link" :href="customer?.website">{{ customer?.website }}</a>
          </div>
          <div class="field-row">
            <p class="field-label">電話番号</p>
            <p class="field-value">{{ customer?.phone }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">説明</p>
            <p class="field-value">{{ customer?.description }}</p>
          </div>
        </div>
      </div>

      <h3>住所情報</h3>
      <div class="section">
        <div class="content">
<!--          <div class="field-row">-->
<!--            <p class="field-label">郵便番号</p>-->
<!--            <p class="field-value">{{ customer?.address.postalCode }}</p>-->
<!--          </div>-->
<!--          <div class="field-row">-->
<!--            <p class="field-label">都道府県</p>-->
<!--            <p class="field-value">{{ customer?.address.prefecture }}</p>-->
<!--          </div>-->
<!--          <div class="field-row">-->
<!--            <p class="field-label">住所</p>-->
<!--            <p class="field-value">{{ customer?.address.detail }}</p>-->
<!--          </div>-->
        </div>
      </div>
    </PageContainer>
  </div>
</template>

<style scoped>

</style>