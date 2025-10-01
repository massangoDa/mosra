<script setup lang="ts">
import Modal from "~/components/Modal.vue";
import {ref} from "vue";
import {useIdStore} from "~/store/idStore";
import {fetchCustomers} from "~/api/customers";
import type {Customer} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";

const customers = ref<Customer[]>([])

definePageMeta({
  layout: 'crm-layout',
})

async function loadCustomers() {
  try {
    // ココでのfetchCustomersは、api/customersの関数
    customers.value = await fetchCustomers();
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
}

onMounted(() => {
  loadCustomers();
})

const showCustomerInfoModal = ref(false);
const submitUrl = computed(() =>
    API_ENDPOINTS.customers.create
)
const customerInfoFields = [
  {
    name: 'companyName',
    label: '取引先名',
    type: 'text',
    placeholder: '取引先名を入力',
    required: true,
  },
  {
    name: 'type',
    label: '種別',
    type: 'text',
    placeholder: '種別を入力',
  },
  {
    name: 'category',
    label: 'カテゴリー',
    type: 'select',
    options: [
      "指定なし",
      "アナリスト",
      "競合他社",
      "顧客",
      "システムインテグレーター",
      "投資家",
      "パートナー企業",
      "報道関係者",
      "見込み客",
      "販売代理店",
      "その他"
    ]
  },
  {
    name: 'website',
    label: 'Webサイト',
    type: 'text',
    placeholder: 'https://massango.jp',
  },
  {
    name: 'phone',
    label: '電話番号',
    type: 'phone',
    placeholder: '03-1234-5678'
  },
  {
    name: 'description',
    label: '説明',
    type: 'textarea',
    placeholder: '会社の説明や備考を入力',
    rows: '3',
    fullWidth: true
  },
]
</script>

<template>
  <div>
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1>顧客情報</h1>
        </div>
        <div class="header-right">
          <button @click="showCustomerInfoModal = true" class="NewInfoButton">+ 顧客情報追加</button>
        </div>
      </div>
      <!--   tableスタイルで行こうぜ   -->
      <div class="table-container">
        <table class="customer-table">
          <thead>
            <tr>
              <th class="sortable">
                取引先名
              </th>
              <th class="sortable">
                電話
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="customer in customers"
              :key="customer._id"
              class="customer-row"
            >
              <td class="company-name" >
                <NuxtLink :to="`/crm/customer/${customer._id}`" class="link">
                  {{ customer.companyName }}
                </NuxtLink>
              </td>
              <td>
                {{ customer.phone || '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <TemplateModal
          v-if="showCustomerInfoModal"
          title="顧客情報"
          section-title="顧客情報を追加"
          :submit-url="submitUrl"
          :fields="customerInfoFields"
          success-message="顧客情報を保存しました"
          @close-modal="showCustomerInfoModal = false"
      />
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
  align-items: center;
}
.header-right {
  display: flex;
  gap: 8px;
}

.NewInfoButton {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.NewInfoButton:hover {
  background-color: #0056b3;
}

.table-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  overflow: hidden;
  min-height: 0;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
}
.customer-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.customer-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  position: relative;
}

.customer-row {
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s ease;
}
.customer-row:hover {
  background-color: #f8f9fa;
}

.customer-table td {
  padding: 12px 16px;
  font-size: 0.9rem;
  vertical-align: middle;
}

.company-name {
  color: #4285f4;
  font-weight: 500;
  cursor: pointer;
}
.company-name:hover {
  text-decoration: underline;
}

.link {
  text-decoration: none;
  color: #4285f4;
  transition: background-color 0.3s ease;
}
.link:hover {
  background-color: transparent;
}

.sortable {
  cursor: pointer;
  user-select: none;
}


</style>