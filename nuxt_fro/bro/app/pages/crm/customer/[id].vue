<script setup lang="ts">
import {ref} from "vue";
import Modal2 from "~/components/Modal2.vue";

definePageMeta({
  layout: 'crm-layout',
})

interface Customer {
  _id: string,
  CompanyName: string,
  type?: string,
  category?: string,
  website?: string,
  phone?: string,
  description?: string,
  address?: {
    postalCode?: string,
    prefecture?: string
    detail?: string
  }
}

interface Transaction {
  product: string,
  amount: number,
  transactionStatus: string,
  _id: string,
}

const customer = ref<Customer | null>(null)
const transaction = ref<Transaction[]>([])
const activePage = ref<'page1' | 'page2' | 'page3'>('page1')

const { id } = useRoute().params;

// 顧客の詳細を取得
async function fetchCustomer() {
  try {
    const res = await fetchData().fetch(`/api/customer/${id}`);

    customer.value = {
      _id: res._id,
      CompanyName: res.CompanyName,
      type: res.type,
      category: res.category,
      website: res.website,
      phone: res.phone,
      description: res.description,
      address: {
        postalCode: res.address.postalCode,
        prefecture: res.address.prefecture,
        detail: res.address.detail,
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 顧客取引情報を取得
async function fetchTransactions() {
  try {
    const res = await fetchData().fetch(`/api/customer/${id}/transactions`);

    transaction.value = res.map((transaction: any) => ({
      product: transaction.product,
      amount: transaction.amount,
      transactionStatus: transaction.transactionStatus,
      _id: transaction._id,
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

const show = ref(false);
const editModalShow = ref(false);
const selectedTransactionId = ref<string | null>(null);

function openEditModal(transactionId: string) {
  selectedTransactionId.value = transactionId;
  editModalShow.value = true;
}

function closeEditModal() {
  editModalShow.value = false;
  selectedTransactionId.value = null;
  fetchTransactions()
}
</script>

<template>
  <div>
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1>{{ customer?.CompanyName || 'Loading...' }}</h1>
        </div>
        <div class="header-right">
          <button @click="show = true" class="NewInfoButton">+ 取引追加</button>
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
                        製品名
                      </th>
                      <th class="sortable">
                        金額
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
                        v-for="transact in transaction"
                        :key="transact._id"
                        class="transaction-row"
                      >
                        <td class="product">
                          {{ transact.product }}
                        </td>
                        <td class="amount">
                          {{ useFormat().formatCurrency(transact.amount) }}
                        </td>
                        <td>
                          {{ transact.transactionStatus }}
                        </td>
                        <td>
                          <button
                            @click="openEditModal(transact._id)"
                            class="edit-button"
                          >
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
                    <p class="field-value">{{ customer?.CompanyName }}</p>
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
                  <div class="field-row">
                    <p class="field-label">郵便番号</p>
                    <p class="field-value">{{ customer?.address.postalCode }}</p>
                  </div>
                  <div class="field-row">
                    <p class="field-label">都道府県</p>
                    <p class="field-value">{{ customer?.address.prefecture }}</p>
                  </div>
                  <div class="field-row">
                    <p class="field-label">住所</p>
                    <p class="field-value">{{ customer?.address.detail }}</p>
                  </div>
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
      <Modal2 @closeModal="show = false" v-if="show" />
      <editModal v-if="editModalShow" :transactionId="selectedTransactionId" @closeModal="closeEditModal" />
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
</style>