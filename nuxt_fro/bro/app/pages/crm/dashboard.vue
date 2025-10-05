<script setup lang="ts">
import {fetchAllInvoices} from "~/api/allInvoices";
import { useToast } from 'vue-toastification'
import type {Invoice} from "~/types/types";

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
    const res = await $fetch('http://localhost:5000/api/dashboard/monthly-sales', {
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
    const res = await $fetch('http://localhost:5000/api/dashboard/unpaid-invoices', {
      headers: {
        Authorization: `Bearer ${useAuth().authToken.value}`
      }
    });
    unpaidInvoices.value = res;
  } catch (error) {
    console.error('Error fetching unpaid invoices:', error);
  }
}

onMounted(() => {
  loadInvoices();
  loadMonthlySales();
  loadUnpaidInvoices();
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
            <div class="schedule-item">
              <div class="schedule-time">10:00</div>
              <div class="schedule-content">
                <p class="schedule-title">定例ミーティング</p>
                <p class="schedule-subtitle">営業チーム</p>
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

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* グリッドセクション */
.grid-section {
  display: grid;
  gap: 20px;
}

.alert-section {
  grid-template-columns: 1fr;
}

.kpi-section {
  grid-template-columns: repeat(3, 1fr);
}

.data-section {
  grid-template-columns: 2fr 1fr;
}

/* カード基本スタイル */
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s ease;
}

/* アラートカード */
.alert-card {
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  border-color: #fc8181;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 28px;
}

.alert-icon {
  font-size: 48px;
  line-height: 1;
}

.alert-content {
  flex: 1;
}

.alert-label {
  font-size: 14px;
  font-weight: 600;
  color: #742a2a;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.alert-value {
  font-size: 36px;
  font-weight: 800;
  color: #c53030;
  margin: 0 0 4px 0;
  line-height: 1;
}

.alert-description {
  font-size: 14px;
  color: #822727;
  margin: 0;
}

/* KPIカード */
.kpi-card {
  padding: 28px;
}

.kpi-card.unpaid {
  background: linear-gradient(135deg, #fffbf0 0%, #fef3c7 100%);
  border-color: #fbbf24;
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-icon {
  font-size: 24px;
}

.kpi-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 40px;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 16px 0;
  line-height: 1;
}

.unit {
  font-size: 24px;
  font-weight: 600;
  color: #64748b;
  margin-left: 4px;
}

.kpi-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
}

.trend-badge.positive {
  background-color: #d1fae5;
  color: #065f46;
}

.trend-badge.negative {
  background-color: #fee2e2;
  color: #991b1b;
}

.trend-arrow {
  font-size: 16px;
}

.trend-text {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.kpi-period,
.kpi-count {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* データカード */
.data-card {
  padding: 28px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.view-all-link {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #2563eb;
}

/* 請求書リスト */
.invoice-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.invoice-item {
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.invoice-item:hover {
  background-color: #f8fafc;
}

.invoice-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  text-decoration: none;
  color: inherit;
}

.invoice-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invoice-number {
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
}

.invoice-date {
  font-size: 13px;
  color: #64748b;
}

.invoice-amount {
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
}

/* スケジュールカード */
.schedule-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #7dd3fc;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.schedule-time {
  font-size: 16px;
  font-weight: 700;
  color: #0369a1;
  min-width: 60px;
}

.schedule-content {
  flex: 1;
}

.schedule-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 4px 0;
}

.schedule-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.empty-state,
.empty-state-schedule {
  text-align: center;
  padding: 32px;
  color: #94a3b8;
  font-size: 14px;
}

.empty-state-schedule {
  padding: 16px;
  margin-top: 8px;
}

/* レスポンシブ対応 */
@media (max-width: 1200px) {
  .kpi-section {
    grid-template-columns: 1fr;
  }

  .data-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 28px;
  }

  .alert-card {
    flex-direction: column;
    text-align: center;
  }

  .kpi-value {
    font-size: 32px;
  }

  .alert-value {
    font-size: 32px;
  }
}
</style>