<script setup lang="ts">
import {ref} from "vue";
import type {Customer} from "~/types/types";
import {fetchCustomer} from "~/api/customer";
import {useCustomerStore} from "~/store/customer";

definePageMeta({
  layout: 'crm-layout'
})

const customerStore = useCustomerStore()

const { customerId } = useRoute().params;

const sidebarLink = [
  {
    name: '顧客一覧に戻る',
    icon: 'md-keyboardreturn',
    to: `/crm/customers/`
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
})

</script>

<template>
  <div>
    <PageContainer :title="customerStore.customer?.companyName" :sidebar="sidebarLink">
      <div v-if="customerStore.customer?.description == ''" class="make-manager">
        <div class="section">
          <div class="content">
            <p>顧客情報に担当者を追加しましょう<NuxtLink to="/crm/contacts">担当者を追加する</NuxtLink></p>
            <p>担当者の連絡先がありませんか？今すぐ連絡先を追加しましょう<NuxtLink to="/crm/contacts">連絡先を追加する</NuxtLink></p>
          </div>
        </div>
      </div>
      <h2>詳細</h2>
      <div class="section">
        <div class="content">
          <div class="field-row">
            <p class="field-label">取引先名</p>
            <p class="field-value">{{ customerStore.customer?.companyName }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">種別</p>
            <p class="field-value">{{ customerStore.customer?.type }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">カテゴリー</p>
            <p class="field-value">{{ customerStore.customer?.category }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">Webサイト</p>
            <a class="field-value-link" :href="customerStore.customer?.website">{{ customerStore.customer?.website }}</a>
          </div>
          <div class="field-row">
            <p class="field-label">電話番号</p>
            <p class="field-value">{{ customerStore.customer?.phone }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">説明</p>
            <p class="field-value">{{ customerStore.customer?.description }}</p>
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