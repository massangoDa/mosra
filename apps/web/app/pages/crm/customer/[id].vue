<script setup lang="ts">
import {ref} from "vue";
import {useIdStore} from "~/store/idStore";
import {fetchCustomer} from "~/api/customer";
import {fetchInvoices} from "~/api/invoices";
import type {Comment, Customer, Invoice} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";
import {useToast} from "vue-toastification";
import '~/assets/css/pages/id.css'

definePageMeta({
  layout: 'crm-layout',
})

const toast = useToast()

const customer = ref<Customer | null>(null)
const invoices = ref<Invoice[]>([])
const comments = ref<Comment[]>([])
const activePage = ref<'page1' | 'page2' | 'page3'>('page1')

// チャット欄の話
const message = ref('')

const { id: customerId } = useRoute().params;

// 顧客の詳細を取得
async function loadCustomer() {
  try {
    customer.value = await fetchCustomer(customerId)
  } catch (error) {
    console.log(error)
  }
}

// 顧客取引情報を取得
async function loadTransaction() {
  try {
    invoices.value = await fetchInvoices(customerId)
  } catch (error) {
    console.log(error)
  }
}

function switchPage(page: 'page1' | 'page2' | 'page3') {
  activePage.value = page
}

onMounted(() => {
  loadCustomer();
  loadTransaction();
  loadComments()
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

// テストで一旦
const showInvoiceModal = ref(false);
const showEditInvoiceModal = ref(false);
const showDeleteInvoiceModal = ref(false);

const submitUrl = computed(() =>
    API_ENDPOINTS.customers.invoices.create(customerId)
)
const submitUrl2 = computed(() =>
    selectedInvoiceId.value
        ? API_ENDPOINTS.customers.invoices.update(customerId, selectedInvoiceId.value)
        : ""
)
const fetchInvoiceField = computed(() =>
    selectedInvoiceId.value
        ? API_ENDPOINTS.customers.invoices.detail(customerId, selectedInvoiceId.value)
        : ""
)
const updateInvoice = computed(() =>
    selectedInvoiceId.value
        ? API_ENDPOINTS.customers.invoices.update(customerId, selectedInvoiceId.value)
        : ""
)
const submitUrl3 = computed(() =>
    API_ENDPOINTS.customers.invoices.delete(customerId, selectedInvoiceId.value)
)

const selectedInvoiceId = ref<string | null>(null)

function openEditModal(invoiceId: string) {
  selectedInvoiceId.value = invoiceId;
  showEditInvoiceModal.value = true;
}
function openDeleteModal(invoiceId: string) {
  selectedInvoiceId.value = invoiceId
  showDeleteInvoiceModal.value = true
}

const invoiceFields = [
  {
    name: 'invoiceNumber',
    label: '請求書番号',
    type: 'text',
    placeholder: 'INV-2025-001',
    required: true,
  },
  {
    name: 'invoiceRequest',
    label: '発行日',
    type: 'date',
    placeholder: 'YYYY/MM/DD',
    format: 'YYYY/MM/DD',
  },
  {
    name: 'invoiceStatus',
    label: 'ステータス',
    type: 'select',
    options: ['完了', '取引中', '未払い']
  },
]

async function handleTransactionSaved() {
  await loadCustomer();
  await loadTransaction();
}

const contextMenu = ref<any>(null)
const contextmenuItems = [
  { id: 'edit', label: '編集' },
  { id: 'delete', label: '削除' },
]
function handleContextMenuClick(invoiceId: string, itemId: string) {
  if (itemId === 'edit') {
    openEditModal(invoiceId)
  } else if (itemId === 'delete') {
    openDeleteModal(invoiceId)
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
                <div class="calcContainer">
                  <span class="sales-label">総売上</span>
                  <span class="sales-amount">{{ useFormat().formatCurrency(customer?.totalAmount || 0) }}</span>
                </div>
                <div class="table-container">
                  <table class="table">
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
                    </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="invoice in invoices"
                        :key="invoice._id"
                        class="table-row"
                        @contextmenu="contextMenu?.openMenu($event, invoice._id)"
                      >
                        <td class="product">
                          <NuxtLink :to="`/crm/customer/${customerId}/invoice/${invoice._id}`" class="invoiceLink">
                            {{ invoice.invoiceNumber }}
                          </NuxtLink>
                        </td>
                        <td class="amount">
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
        v-if="showInvoiceModal"
        title="請求書追加"
        section-title="請求情報を追加"
        :submit-url="submitUrl"
        :fields="invoiceFields"
        success-message="請求書を保存しました"
        @close-modal="showInvoiceModal = false"
        @refresh="loadTransaction(); loadCustomer();"
      />

<!--      <TemplateModal-->
<!--          v-if="showEditInvoiceModal"-->
<!--          title="請求書修正"-->
<!--          section-title="請求書を修正"-->
<!--          :update-url="submitUrl2"-->
<!--          :fields="invoiceFields"-->
<!--          success-message="請求書を保存しました"-->
<!--          @close-modal="showEditInvoiceModal = false"-->
<!--          :invoiceId="selectedInvoiceId"-->
<!--          :customerId="customerId"-->
<!--          :editInvoice="true"-->
<!--          @refresh="handleTransactionSaved"-->
<!--      />-->

      <EditModal
          v-if="showEditInvoiceModal"
          title="請求書修正"
          section-title="請求書を修正"
          :fetch-url="fetchInvoiceField"
          :update-url="updateInvoice"
          :fields="invoiceFields"
          success-message="請求書を保存しました"
          @close-modal="showEditInvoiceModal = false"
          @refresh="handleTransactionSaved"
      />

      <DeleteModal
          v-if="showDeleteInvoiceModal"
          title="請求書削除"
          section-title="請求書を削除しようとしています"
          :delete-url="submitUrl3"
          success-message="請求書を削除しました"
          @close-modal="showDeleteInvoiceModal = false"
          :transactionId="selectedInvoiceId"
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
</style>