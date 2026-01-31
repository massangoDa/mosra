<script setup lang="ts">
import {fetchAllInvoices} from "~/api/allInvoices";
import { useToast } from 'vue-toastification'
import type {Calendar, Invoice} from "~/types/types";
import {ref} from "vue";
import {API_ENDPOINTS} from "~/api/endpoints";
import '~/assets/css/pages/dashboard.css'

definePageMeta({
  layout: 'crm-layout',
})

const toast = useToast();

const { userInfo, loading, fetchUserInfo, authToken } = useAuth()

watch(authToken, async (newToken) => {
  if (newToken && !userInfo.value) {
    await fetchUserInfo()
  }
}, {
  immediate: true,
})

const invoices = ref<Invoice[]>([])

async function loadInvoices() {
  try {
    invoices.value = await fetchAllInvoices();
  } catch (error) {
    console.error('Error fetching invoices:', error);
    toast.error("エラーが発生");
  }
}

const monthlySales = ref({
  currentMonth: { totalAmount: 0, count: 0 },
  lastMonth: { totalAmount: 0 },
  comparison: { percentageChange: '0', isPositive: true }
});

async function loadMonthlySales() {
  try {
    const res = await $fetch('/api/dashboard/monthly-sales', {
      headers: {
        Authorization: `Bearer ${useAuth().authToken.value}`
      }
    });
    monthlySales.value = res;
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
  }
}

const unpaidInvoices = ref({ totalAmount: 0, count: 0 });

async function loadUnpaidInvoices() {
  try {
    const res = await $fetch('/api/dashboard/unpaid-invoices', {
      headers: {
        Authorization: `Bearer ${useAuth().authToken.value}`
      }
    });
    unpaidInvoices.value = res;
  } catch (error) {
    console.error('Error fetching unpaid invoices:', error);
  }
}

// 今日の予定を表示
const events = ref<Calendar[]>([])

async function loadSchedule() {
  try {
    const res = await $fetch('/api/today-calendar-events', {
      headers: {
        Authorization: `Bearer ${useAuth().authToken.value}`
      }
    });
    events.value = res;
  } catch (error) {
    console.error('Error fetching schedule:', error);
  }
}

// 顧客の名前を取得
const companyNames = ref<Record<string, string>>({});

async function loadInvoiceCompanyNames() {
  try {
    for (const invoice of invoices.value.slice(0, 5)) {
      if (invoice.customerId && !companyNames.value[invoice.customerId]) {
        await loadCompanyName(invoice.customerId);
      }
    }
  } catch (error) {
    console.error('Error fetching company name:', error);
  }
}

async function loadCompanyName(customerId: string) {
  try {
    const res = await fetchData().fetch(API_ENDPOINTS.search.companyName(customerId))
    companyNames.value[customerId] = res?.companyName || '';
  } catch (error) {
    console.error('Error fetching company name:', error);
  }
}

onMounted(async () => {
  await loadInvoices();
  await loadInvoiceCompanyNames();
  loadMonthlySales();
  loadUnpaidInvoices();
  loadSchedule();
})
</script>

<template>
<div>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h1 class="page-title">ダッシュボード</h1>
      </div>
    </div>
    <div class="dashboard-container">
      <!-- アラート -->
      <div class="grid-section alert-section" v-if="unpaidInvoices.count != 0">
        <div class="card alert-card">
          <div class="alert-content">
            <p class="alert-label">期日超過</p>
            <h2 class="alert-value">{{ unpaidInvoices.count }}<span class="unit">件</span></h2>
            <p class="alert-description">期限を過ぎている請求書があります</p>
          </div>
        </div>
      </div>

      <!-- KPI指標 -->
      <div class="grid-section kpi-section">
        <div class="card kpi-card">
          <div class="kpi-header">
            <p class="kpi-label">今月の売上</p>
          </div>
          <h2 class="kpi-value">
            {{ useFormat().formatCurrency(monthlySales.currentMonth.totalAmount) }}
          </h2>
          <div class="kpi-footer">
            <span
                class="trend-badge"
                :class="monthlySales.comparison.isPositive ? 'positive' : 'negative'"
            >
              <span class="trend-arrow">{{ monthlySales.comparison.isPositive ? '↑' : '↓' }}</span>
              {{ Math.abs(parseFloat(monthlySales.comparison.percentageChange)) }}%
            </span>
            <span class="trend-text">前月比</span>
          </div>
        </div>

        <div class="card kpi-card">
          <div class="kpi-header">
            <p class="kpi-label">成約件数</p>
          </div>
          <h2 class="kpi-value">{{ monthlySales.currentMonth.count }}<span class="unit">件</span></h2>
          <div class="kpi-footer">
            <span class="kpi-period">今月</span>
          </div>
        </div>

        <div class="card kpi-card unpaid">
          <div class="kpi-header">
            <p class="kpi-label">未収金</p>
          </div>
          <h2 class="kpi-value">
            {{ useFormat().formatCurrency(unpaidInvoices.totalAmount) }}
          </h2>
          <div class="kpi-footer">
            <span class="kpi-count">{{ unpaidInvoices.count }}件の請求書</span>
          </div>
        </div>
      </div>

      <!-- データテーブル -->
      <div class="grid-section data-section">
        <div class="card data-card">
          <div class="card-header">
            <h3 class="card-title">最新の請求書</h3>
            <NuxtLink to="/crm/invoices" class="view-all-link">すべて表示 →</NuxtLink>
          </div>
          <div class="invoice-list">
            <div
                v-for="invoice in invoices.slice(0, 5)"
                :key="invoice._id"
                class="invoice-item"
            >
              <NuxtLink
                  :to="`/crm/customer/${invoice.customerId}/invoice/${invoice._id}`"
                  class="invoice-link"
              >
                <div class="invoice-main">
                  <span class="company-name">{{ companyNames[invoice.customerId] || '読み込み中' }}</span>
                  <span class="invoice-number">{{ invoice.invoiceNumber }}</span>
                  <span class="invoice-date">{{ invoice.invoiceRequest }}</span>
                </div>
                <span class="invoice-amount">
                  {{ useFormat().formatCurrency(invoice.totalAmount) }}
                </span>
              </NuxtLink>
            </div>
            <div v-if="invoices.length === 0" class="empty-state">
              請求書がありません
            </div>
          </div>
        </div>

        <div class="card data-card schedule-card">
          <div class="card-header">
            <h3 class="card-title">今日の予定</h3>
          </div>
          <div class="schedule-list">
            <div
                v-for="event in events"
                class="schedule-item"
            >
              <div class="schedule-time">{{ event.startTime.split('T')[1].substring(0,5) }}</div>
              <div class="schedule-content">
                <p class="schedule-title">{{ event.title }}</p>
              </div>
            </div>
            <div class="empty-state-schedule">
              予定はカレンダーから確認できます
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>

</style>