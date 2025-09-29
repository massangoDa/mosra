<script setup lang="ts">
import {ref} from "vue";
import Modal2 from "~/components/Modal2.vue";
import SeikyuuModal from "~/components/SeikyuuModal.vue";

definePageMeta({
  layout: 'crm-layout',
})

interface Customer {
  _id: string,
  companyName: string,
  type?: string,
  category?: string,
  website?: string,
  phone?: string,
  description?: string,
}

interface Invoice {
  invoiceNumber: string,
  totalAmount: number,
  invoiceRequest: string,
  invoiceStatus: string,
  _id: string,
}

const customer = ref<Customer | null>(null)
const invoice = ref<Invoice[]>([])
const activePage = ref<'page1' | 'page2' | 'page3'>('page1')

const { id } = useRoute().params;

// 顧客の詳細を取得
async function fetchCustomer() {
  try {
    const res = await fetchData().fetch(`/api/customer/${id}`);

    customer.value = {
      _id: res._id,
      companyName: res.companyName,
      type: res.type,
      category: res.category,
      website: res.website,
      phone: res.phone,
      description: res.description,
    }
  } catch (error) {
    console.log(error)
  }
}

// 顧客取引情報を取得
async function fetchTransactions() {
  try {
    const res = await fetchData().fetch(`/api/customer/${id}/invoices`);

    invoice.value = res.map((invoice: any) => ({
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      invoiceRequest: invoice.invoiceRequest,
      invoiceStatus: invoice.invoiceStatus,
      _id: invoice._id,
    }))
  } catch (error) {
    console.log(error)
  }
}

function switchPage(page: 'page1' | 'page2' | 'page3') {
  activePage.value = page
}

onMounted(() => {
  fetchCustomer();
  fetchTransactions();
})

// テストで一旦
const showInvoiceModal = ref(false);
const showEditInvoiceModal = ref(false);

const submitUrl = computed(() =>
    `/customer/${id}/invoices`
)

const selectedInvoiceId = ref<string | null>(null)

function openEditModal(invoiceId: string) {
  selectedInvoiceId.value = invoiceId;
  showEditInvoiceModal.value = true;
}

const submitUrl2 = computed(() =>
    selectedInvoiceId.value
        ? `/customer/${id}/invoices/edit/${selectedInvoiceId.value}`
        : ""
)

const invoiceFields = [
  {
    name: 'invoiceNumber',
    label: '請求書番号',
    type: 'text',
    placeholder: 'INV-2025-001',
    required: true,
  },
  {
    name: 'totalAmount',
    label: '合計請求金額',
    type: 'number',
    placeholder: '金額を入力',
  },
  {
    name: 'invoiceRequest',
    label: '発行日',
    type: 'text',
    placeholder: '2025/09/20',
  },
  {
    name: 'invoiceStatus',
    label: 'ステータス',
    type: 'select',
    options: ['完了', '取引中', '停滞中']
  },
]
</script>

<template>
  <div>
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1>{{ customer?.companyName || 'Loading...' }}</h1>
        </div>
        <div class="header-right">
          <button @click="showInvoiceModal = true" class="NewInfoButton">+ 請求書追加</button>
        </div>
      </div>
      <div class="detailContainer">
        <div class="leftDetail">
          <div class="detailContent">
            <div class="tabs">
              <a
                  class="link"
                  :class="{ active: activePage === 'page1' }"
                  @click.prevent="switchPage('page1')"
              >
                取引
              </a>
              <a
                  class="link"
                  :class="{ active: activePage === 'page2' }"
                  @click.prevent="switchPage('page2')"
              >
                案件
              </a>
              <a
                  class="link"
                  :class="{ active: activePage === 'page3' }"
                  @click.prevent="switchPage('page3')"
              >
                詳細
              </a>
            </div>

            <!-- テーブルと通常の入れ替わり式(アルバイトは時給980円～) -->
            <div class="page-content">
              <div v-if="activePage === 'page1'" class="page page1">
                <div class="table-container">
                  <table class="history-table">
                    <thead>
                    <tr>
                      <th class="sortable">
                        請求書番号
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
                      <th class="sortable">
                        編集
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="aInvoice in invoice"
                        :key="aInvoice._id"
                        class="transaction-row"
                      >
                        <td class="product">
                          <NuxtLink :to="`/crm/customer/${id}/invoice/${aInvoice._id}`" class="invoiceLink">
                            {{ aInvoice.invoiceNumber }}
                          </NuxtLink>
                        </td>
                        <td class="amount">
                          {{ useFormat().formatCurrency(aInvoice.totalAmount) }}
                        </td>
                        <td>
                          {{ aInvoice.invoiceRequest }}
                        </td>
                        <td>
                          {{ aInvoice.invoiceStatus }}
                        </td>
                        <td>
                          <button @click="openEditModal(aInvoice._id)" class="edit-button">
                            <v-icon name="la-edit-solid" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-if="activePage === 'page2'" class="page page2">
              </div>
              <div v-if="activePage === 'page3'" class="page page2">
                <h3>基本情報</h3>
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
                    <p class="field-value">{{ customer?.website }}</p>
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
                <h3>住所情報</h3>
                <div class="content">
<!--                  <div class="field-row">-->
<!--                    <p class="field-label">郵便番号</p>-->
<!--                    <p class="field-value">{{ customer?.address.postalCode }}</p>-->
<!--                  </div>-->
<!--                  <div class="field-row">-->
<!--                    <p class="field-label">都道府県</p>-->
<!--                    <p class="field-value">{{ customer?.address.prefecture }}</p>-->
<!--                  </div>-->
<!--                  <div class="field-row">-->
<!--                    <p class="field-label">住所</p>-->
<!--                    <p class="field-value">{{ customer?.address.detail }}</p>-->
<!--                  </div>-->
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="rightDetail">
          <div class="detailContent">
            <div class="detailHeader">
              <NuxtLink class="link active">活動</NuxtLink>
            </div>
            <p>テスト</p>
          </div>
        </div>
      </div>
      <TemplateModal
        v-if="showInvoiceModal"
        title="請求書追加"
        section-title="請求情報を追加"
        :submit-url="submitUrl"
        :fields="invoiceFields"
        success-message="請求書を保存しました"
        @close-modal="showInvoiceModal = false"
      />

      <TemplateModal
          v-if="showEditInvoiceModal"
          title="請求書修正"
          section-title="請求書を修正"
          :submit-url="submitUrl2"
          :fields="invoiceFields"
          success-message="請求書を保存しました"
          @close-modal="showEditInvoiceModal = false"
          :invoiceId="selectedInvoiceId"
          :customerId="id"
          :editInvoice="true"
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
  flex-direction: column;
}
.header-right {
  display: flex;
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

.link {
  padding: 4px 24px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: #666;
}
.link:hover {
  border-bottom: 2px solid #2376cc;
  background-color: transparent;
}
.link.active {
  border-bottom: 2px solid #2376cc;
}

.invoiceLink {
  color: orange;
  text-decoration: underline;
}

.detailContainer {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  gap: 20px;
}

.leftDetail {
  width: 70%;
  background-color: #fff;
  border-radius: 8px;
}

.detailContent {
  padding: 16px;
}

.rightDetail {
  width: 30%;
  height: 50%;
  background-color: #fff;
  border-radius: 8px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.content {
  padding: 0;
}

.field-row {
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 20px;
}
.field-row:first-child{
  margin-top: 10px
}
.field-row:last-child {
  border-bottom: none;
}

.field-label {
  width: 120px;
  color: #666;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.field-value {
  flex: 1;
  color: #333;
  font-size: 0.9rem;
  margin-left: 40px;
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

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.history-table th {
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

.history-table td {
  padding: 12px 16px;
  font-size: 0.9rem;
  vertical-align: middle;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.edit-button {
  background: #f7fafc;
  border: 1px solid #dddddd;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #718096;
}
.edit-button:hover {
  background: #2376cc;
  border-color: #2376cc;
  color: white;
}
</style>