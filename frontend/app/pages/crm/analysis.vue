<script setup lang="ts">
import {DoughnutChart} from "vue-chart-3";
import {fetchCustomers} from "~/api/customers";
import {Chart, registerables} from "chart.js";
import {ref} from "vue";
import type {Customer} from "~/types/types";
import '~/assets/css/pages/analysis.css'
import {API_ENDPOINTS} from "~/api/endpoints";

definePageMeta({
  layout: 'crm-layout',
})

Chart.register(...registerables);

const customers = ref<Customer[] | null>(null)

const chartData = computed(() => {
  if (!customers.value || customers.value.length === 0) {
    return null
  }

  return {
    labels: customers.value.map(customer => customer.companyName),
    datasets: [{
      label: '金額',
      data: customers.value.map(customer => customer.totalAmount),
      backgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40"
      ],
    }]
  }
})

// 売上計算
const salesCalc = computed(() => {
  if (!customers.value) return 0;

  return customers.value.reduce((sum, customer) => {
    return sum + Number(customer.totalAmount || 0);
  }, 0);
});

// 顧客数
const customerCount = computed(() => {
  return customers.value?.length || 0;
})

onMounted(async () => {
  await useDataLoader().loadData(API_ENDPOINTS.customers.list, customers)
})
</script>

<template>
<div>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h1 class="page-title">分析</h1>
        <p class="page-subtitle">ビジネスの成長を可視化</p>
      </div>
    </div>
    <div class="analysis-container">
      <!-- サマリーセクション -->
      <div class="summary-grid">
        <div class="summary-card card">
          <div class="card-content">
            <p class="card-label">総売上高</p>
            <h2 class="card-value">{{ useFormat().formatCurrency(salesCalc) }}</h2>
          </div>
        </div>
        <div class="summary-card card">
          <div class="card-content">
            <p class="card-label">顧客数</p>
            <h2 class="card-value">{{ customerCount }}</h2>
            <p class="card-subtext">社</p>
          </div>
        </div>
      </div>
      <!-- チャートのセクション -->
      <div class="chart-section">
        <div class="section-header">
          <h2 class="section-title">売上構成比</h2>
          <p class="section-description">顧客別の売上割合を可視化</p>
        </div>
        <div class="chart-container">
          <DoughnutChart
              v-if="chartData"
              :chartData="chartData"
              :options="{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 20,
                      font: {
                        size: 12
                      }
                    }
                  }
                }
              }"
              class="chart"
          />
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>

</style>