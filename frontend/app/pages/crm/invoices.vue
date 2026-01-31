<script setup lang="ts">
import { useToast } from 'vue-toastification'
import type {Invoice} from "~/types/types";
import {fetchAllInvoices} from "~/api/allInvoices";
import '~/assets/css/pages/id.css'

definePageMeta({
  layout: 'crm-layout',
})

const invoices = ref<Invoice[]>([])
const toast = useToast();

async function loadInvoices() {
  try {
    invoices.value = await fetchAllInvoices();
  } catch (error) {
    console.error('Error fetching invoices:', error);
  }
}

onMounted(() => {
  loadInvoices();
})
</script>

<template>
<div>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h1>請求書一覧</h1>
      </div>
    </div>
    <div class="page-content">
      <div class="table-container">
        <table class="table">
          <thead>
          <tr>
            <th class="sortable">
              請求書名
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
              :class="{
                'table-row': true,
                'success': invoice.invoiceStatus == '完了',
                'progress': invoice.invoiceStatus == '取引中'
              }"
          >
            <td class="product">
              <NuxtLink :to="`/crm/customer/${invoice.customerId}/invoice/${invoice._id}`" class="invoiceLink">
                <strong>{{ invoice.invoiceNumber }}</strong>
              </NuxtLink>
            </td>
            <td>
              {{ useFormat().formatCurrency(invoice.totalAmount) }}
            </td>
            <td>
              {{ invoice.invoiceRequest }}
            </td>
            <td>
              <span :class="['status-badge', `status-${invoice.invoiceStatus}`]">
                {{ invoice.invoiceStatus }}
              </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.page-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  gap: 20px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-完了 {
  background-color: #d1fae5;
  color: #065f46;
}

.status-取引中 {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-未払い {
  background-color: #f8d7da;
  color: #842029;
}
</style>