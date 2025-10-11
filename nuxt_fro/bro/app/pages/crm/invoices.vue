<script setup lang="ts">
import { useToast } from 'vue-toastification'
import type {Invoice} from "~/types/types";
import {fetchAllInvoices} from "~/api/allInvoices";

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
        <table class="invoices-table">
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
                'transaction-row': true,
                'success': invoice.invoiceStatus == '完了'
              }"
          >
            <td class="product">
              <NuxtLink :to="`/crm/customer/${invoice.customerId}/invoice/${invoice._id}`" class="invoiceLink">
                {{ invoice.invoiceNumber }}
              </NuxtLink>
            </td>
            <td>
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
</div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.page-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  gap: 20px;
}

.table-container {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  overflow: hidden;
  min-height: 0;
  margin-top: 1em;
}

.invoices-table {
  width: 100%;
  border-collapse: collapse;
}

.invoices-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.invoices-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  position: relative;
}

.transaction-row {
  border-bottom: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.transaction-row:hover {
  background-color: #f8f9fa;
}

.invoices-table td {
  padding: 12px 16px;
  font-size: 0.9rem;
  vertical-align: middle;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.invoiceLink {
  color: orange;
  text-decoration: underline;
}

.transaction-row.success {
  background-color: #e8f5e9;
}

.transaction-row.success:hover {
  background-color: #c8e6c9;
}

.success {
  background-color: #bcedc2;
}
</style>