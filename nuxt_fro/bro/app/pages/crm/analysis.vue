<script setup lang="ts">
import {DoughnutChart} from "vue-chart-3";
import {fetchCustomers} from "~/api/customers";
import {Chart, registerables} from "chart.js";
import {ref} from "vue";
import type {Customer} from "~/types/types";

definePageMeta({
  layout: 'crm-layout',
})

Chart.register(...registerables);

const customers = ref<Customer[] | null>(null)

async function loadCustomers() {
  try {
    customers.value = await fetchCustomers();
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
}

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

onMounted(() => {
  loadCustomers();
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
.container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.header {
  margin-bottom: 20px;
}
.page-title {
  font-weight: 700;
  margin: 0 0 4px 0;
}
.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.analysis-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.summary-card {
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
  margin: 0 0 8px 0;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.card-subtext {
  font-size: 1rem;
  opacity: 0.8;
  font-weight: 500;
  color: #6b7280;
}

.chart-section {
  background-color: #fff;
  border-radius: 16px;
  padding: 32px;
}

.section-header {
  margin-bottom: 24px;
}
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}
.section-description {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.chart-container {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>