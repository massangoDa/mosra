<script setup lang="ts">
import {ref} from "vue";
import { useToast } from 'vue-toastification'
import {fetchCustomer} from "~/api/customer";
import {fetchTransactions} from "~/api/transactions";
import type {Customer, Invoice, Transaction, Comment} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchInvoice} from "~/api/invoice";

definePageMeta({
  layout: 'crm-layout',
})

const toast = useToast()

const customer = ref<Customer | null>(null)
const transaction = ref<Transaction[]>([])
const invoice = ref<Invoice | null>(null)
const comments = ref<Comment[]>([])
const activePage = ref<'page1' | 'page2' | 'page3'>('page1')

// チャット欄の話
const message = ref('')

const { customerId, invoiceId } = useRoute().params;

// 顧客の詳細を取得
async function loadCustomer() {
  try {
    customer.value = await fetchCustomer(customerId);
  } catch (error) {
    console.log(error)
  }
}

// 顧客取引情報を取得
async function loadTransactions() {
  try {
    transaction.value = await fetchTransactions(customerId, invoiceId);
  } catch (error) {
    console.log(error)
  }
}

// 請求書情報を取得
async function loadInvoice() {
  try {
    invoice.value = await fetchInvoice(customerId, invoiceId);
    console.log(invoice.value)
  } catch (error) {
    console.log(error)
  }
}

function switchPage(page: 'page1' | 'page2' | 'page3') {
  activePage.value = page
}

onMounted(async () => {
  await Promise.all([
    loadCustomer(),
    loadTransactions(),
    loadInvoice(),
    loadComments()
  ]);
})

// コメントを送信
async function sendChat() {
  try {
    if (message.value.trim() === '') {
      return;
    }
    const sendMessage = message.value;
    message.value = '';

    const res = await $fetch(API_ENDPOINTS.comments.create(customerId), {
      method: 'POST',
      body: { message: sendMessage },
      headers: {
        Authorization: `Bearer ${useAuth().authToken.value}`
      },
    })

    await loadComments();

    toast.success("チャットを送信しました");
  } catch (error) {
    console.log(error)
    message.value = '';
  }
}

// コメントをロード
async function loadComments() {
  try {
    const res = await fetchData().fetch(API_ENDPOINTS.comments.list(customerId))

    comments.value = res;
  } catch (error) {
    console.log(error)
  }
}

// Modal呼び出し
const showInvoiceAddModal = ref(false);
const showEditInvoiceModal = ref(false);
const showDeleteInvoiceModal = ref(false);

const selectedTransactionId = ref<string | null>(null)

function openEditModal(transactionId: string) {
  selectedTransactionId.value = transactionId
  showEditInvoiceModal.value = true
}

function openDeleteModal(transactionId: string) {
  selectedTransactionId.value = transactionId
  showDeleteInvoiceModal.value = true
}

const submitUrl = computed(() =>
    API_ENDPOINTS.customers.transactions.create(customerId)
)
const submitUrl2 = computed(() =>
    selectedTransactionId.value
        ? API_ENDPOINTS.customers.invoices.transactionUpdate(customerId, invoiceId, selectedTransactionId.value)
        : ""
)
const submitUrl3 = computed(() =>
  API_ENDPOINTS.customers.invoices.transactionDelete(customerId, invoiceId, selectedTransactionId.value)
)

const invoiceAddFields = [
  {
    name: 'product',
    label: '製品名',
    type: 'text',
    placeholder: '製品名を追加',
    required: true,
  },
  {
    name: 'amount',
    label: '金額',
    type: 'number',
    placeholder: '金額を入力',
  },
  {
    name: 'cost',
    label: '原価',
    type: 'number',
    placeholder: '製品の原価',
  },
  {
    name: 'tax_rate',
    label: '税率',
    type: 'select',
    options: [
        "10",
        "8",
        "5",
        "0",
    ]
  }
]

async function handleTransactionSaved() {
  await loadTransactions();
  await loadCustomer();
  await loadInvoice();
}

const contextMenu = ref<any>(null);
const contextmenuItems = [
  { id: 'edit', label: '編集' },
  { id: 'delete', label: '削除' },
];
function handleContextMenuClick(transactionId: string, itemId: string) {
  if (itemId === 'edit') {
    openEditModal(transactionId)
  } else if (itemId === 'delete') {
    openDeleteModal(transactionId)
  }
}
</script>

<template>
  <div>
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1>{{ customer?.companyName || 'Loading...' }}</h1>
        </div>
        <div class="header-right">
          <button @click="showInvoiceAddModal = true" class="NewInfoButton">+ 取引追加</button>
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
                <div class="calcContainer">
                  <span class="sales-label">合計金額</span>
                  <span class="sales-amount">{{ useFormat().formatCurrency(invoice?.totalAmount || 0) }}</span>
                </div>
                <div class="table-container">
                  <table class="table">
                    <thead>
                    <tr>
                      <th class="sortable">
                        製品名
                      </th>
                      <th class="sortable">
                        金額
                      </th>
                      <th class="sortable">
                        原価
                      </th>
                      <th class="sortable">
                        税額
                      </th>
                      <th class="sortable">
                        税率
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr
                        v-for="transact in transaction"
                        :key="transact._id"
                        class="table-row"
                        @contextmenu="contextMenu?.openMenu($event, transact._id)"
                    >
                      <td class="product">
                        {{ transact.product }}
                      </td>
                      <td class="amount">
                        {{ useFormat().formatCurrency(transact.amount) }}
                      </td>
                      <td>
                        {{ useFormat().formatCurrency(transact.cost) }}
                      </td>
                      <td>
                        {{ useFormat().formatCurrency(transact.taxInAmount) }}
                      </td>
                      <td>
                        {{ transact.tax_rate }} %
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
              <NuxtLink class="link active">コメント</NuxtLink>
            </div>
            <div class="commentContainer">
              <div class="commentList">
                <div
                    v-for="comment in comments"
                    :key="comment._id"
                    class="commentItem">
                  <div class="commentHeader">
                    <p class="commentName">{{ comment.name }}</p>
                    <p class="commentDate">{{ useFormat().formatDate(comment.createdAt) }}</p>
                  </div>
                  <p class="commentText">{{ comment.comment }}</p>
                </div>
              </div>
              <div class="commentInput">
                <span>内容:</span>
                <textarea v-model="message"></textarea>
                <button @click="sendChat">送信</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TemplateModal
          v-if="showInvoiceAddModal"
          title="取引情報"
          section-title="取引情報を追加"
          :submit-url="submitUrl"
          :fields="invoiceAddFields"
          success-message="取引情報を保存しました"
          @close-modal="showInvoiceAddModal = false"
          :invoiceId="invoiceId"
          @refresh="handleTransactionSaved"
      />

      <TemplateModal
          v-if="showEditInvoiceModal"
          title="取引情報修正"
          section-title="取引情報を修正"
          :update-url="submitUrl2"
          :fields="invoiceAddFields"
          success-message="取引情報を保存しました"
          @close-modal="showEditInvoiceModal = false"
          :transactionId="selectedTransactionId"
          :editTransaction="true"
          @refresh="handleTransactionSaved"
      />

      <DeleteModal
          v-if="showDeleteInvoiceModal"
          title="取引情報削除"
          section-title="取引情報を削除しようとしています"
          :delete-url="submitUrl3"
          success-message="取引情報を削除しました"
          @close-modal="showDeleteInvoiceModal = false"
          :transactionId="selectedTransactionId"
          @refresh="handleTransactionSaved"
      />

      <ContextMenu
          ref="contextMenu"
          :items="contextmenuItems"
          @item-click="handleContextMenuClick"
      />
    </div>
  </div>
</template>

<style scoped>
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

.sortable {
  user-select: none;
}

.calcContainer {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
  text-align: center;
}
.calcContainer .sales-label {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}
.calcContainer .sales-amount {
  color: #111827;
  font-size: 32px;
  font-weight: 700;
}

:root.dark {
  .calcContainer {
    background: #2d3748;
    border-color: #4a5568;
  }
  .calcContainer .sales-label {
    color: #cbd5e0;
  }
  .calcContainer .sales-amount {
    color: #cbd5e0;
  }
  .link {
    color: #cbd5e0;
  }
  .field-label {
    color: #cbd5e0;
  }
  .field-value {
    color: #cbd5e0;
  }
}
</style>