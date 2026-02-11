<script setup lang="ts">
import {ref} from "vue";
import type {Customer, Case} from "~/types/types";
import {fetchCustomer} from "~/api/customer";
import '~/assets/css/pages/id.css'
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchCase} from "~/api/cases";
import {useCustomerStore} from "~/store/customer";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";

definePageMeta({
  layout: 'crm-layout'
})

const caseData = ref<Case[] | null>(null)
const customerStore = useCustomerStore()

const { customerId } = useRoute().params;

const sidebarLink = [
  {
    name: '顧客一覧に戻る',
    icon: 'md-keyboardreturn',
    to: `/crm/customers/`
  },
  {
    name: '案件',
    icon: 'md-viewkanban',
    to: `/crm/customer/${customerId}/cases`
  },
  {
    name: '詳細',
    icon: 'md-info',
    to: `/crm/customer/${customerId}/details`
  }
]

const showCaseModal = ref(false)
const showCaseEditModal = ref(false)
const showCaseDeleteModal = ref(false)

const caseFormData = reactive({
  category: '',
  billingCycle: ''
})

const hasCases = computed(() => {
  return caseData.value && caseData.value.length > 0
})

const caseFields = computed(() => [
  {
    name: 'caseName',
    label: '案件名',
    type: 'text',
    required: true
  },
  {
    name: 'caseDescription',
    label: '案件概要',
    type: 'textarea',
  },
  {
    name: 'category',
    label: '区分',
    type: 'select',
    options: ['保守', '単発', 'その他'],
  },
  {
    name: 'caseStartDate',
    label: '予定開始日',
    type: 'date',
    format: 'YYYY/MM/DD',
    required: true
  },
  {
    name: 'caseFinishDate',
    label: '予定終了日',
    type: 'date',
    format: 'YYYY/MM/DD',
  },
  {
    name: 'amount',
    label: caseFormData.category === '単発'
        ? '金額(総額)'
        : '金額(月額)',
    type: 'number',
  },
  {
    name: 'billingCycle',
    label: '請求サイクル',
    type: 'select',
    options: caseFormData.category === '単発'
        ? ['一回のみ']
        :['毎月', '2ヶ月毎', '年1回', '一回のみ'],
  },
  {
    name: 'status',
    label: 'ステータス',
    type: 'select',
    options: ['見積中', '進行中', '停止', '完了'],
  }
])

watch(() => caseFormData.category, (newVal) => {
  if (newVal === '単発') {
    caseFormData.billingCycle = '一回のみ'
  }
})

const selectedCaseId = ref<string | null>(null)

function openEditModal(caseId: string) {
  selectedCaseId.value = caseId;
  showCaseEditModal.value = true;
}
function openDeleteModal(caseId: string) {
  selectedCaseId.value = caseId
  showCaseDeleteModal.value = true
}

const contextMenu = ref<any>(null)
const contextMenuItems = [
  { id: 'edit', label: '編集' },
  { id: 'delete', label: '削除' },
]
function handleContextMenuClick(caseId: string, itemId: string) {
  if (itemId === 'edit') {
    openEditModal(caseId)
  } else if (itemId === 'delete') {
    openDeleteModal(caseId)
  }
}

function getStatusClass(status: string) {
  switch(status) {
    case '進行中': return 'status-progress'
    case '完了': return 'status-completed'
    case '見積中': return 'status-estimating'
    case '停止': return 'status-stopped'
    default: return 'status-other'
  }
}

async function loadCaseData() {
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.list(customerId), caseData)
}

onMounted(async () => {
  await customerStore.loadCustomer(customerId)
  await loadCaseData()
})
</script>


<template>
  <div>
    <PageContainer :title="customerStore.customer?.companyName" :sidebar="sidebarLink">
      <template #header-right>
        <button @click="showCaseModal = true" class="NewInfoButton">+ 案件追加</button>
      </template>
      <div v-if="!hasCases" class="make-manager">
        <div class="section">
          <div class="content">
            <div class="message-item">
              <p>まだ案件が登録されていません。最初の案件を登録して、プロジェクトをスタートしましょう！</p>
            </div>
          </div>
        </div>
      </div>
      <h2>案件</h2>
      <div class="section">
        <div class="content">
          <div class="grid-section">
            <NuxtLink class="card section case-link"
                      v-for="caseItem in caseData"
                      :key="caseItem._id"
                      :to="'/crm/customer/' + customerId + '/case/' + caseItem._id"
                      @contextmenu="contextMenu?.openMenu($event, caseItem._id)"
            >
              <div class="card-header">
                <p class="case-name">{{ caseItem.caseName }}</p>
                <span class="status" :class="getStatusClass(caseItem.status)">{{ caseItem.status }}</span>
              </div>

              <div class="card-sub-content">
                <p class="category">{{ caseItem.category }}</p>
                <p class="value">
                  {{ useFormat().formatCurrency(caseItem.amount) }}
                  <span class="cycle" v-if="caseItem.billingCycle && caseItem.billingCycle !== '一回のみ'">
                / {{ caseItem.billingCycle }}
              </span>
                </p>
              </div>

              <p class="date">{{ useFormat().formatDate(caseItem.caseStartDate) }} → {{ useFormat().formatDate(caseItem.caseFinishDate) }}</p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </PageContainer>
    <Modal
        v-if="showCaseModal"
        v-model:form-data="caseFormData"
        title="案件追加"
        section-title="案件を追加"
        :submit-url="NEW_API_ENDPOINTS.customers.cases.create(customerId)"
        :fields="caseFields"
        success-message="案件を保存しました"
        @close-modal="showCaseModal = false"
        @refresh="loadCaseData()"
    />
    <EditModal
        v-if="showCaseEditModal"
        title="案件編集"
        section-title="案件を編集"
        :fetch-url="NEW_API_ENDPOINTS.customers.cases.detail(customerId, selectedCaseId)"
        :update-url="NEW_API_ENDPOINTS.customers.cases.update(customerId, selectedCaseId)"
        :fields="caseFields"
        success-message="案件を更新しました"
        @close-modal="showCaseEditModal = false"
        @refresh="loadCaseData()"
    />
    <DeleteModal
        v-if="showCaseDeleteModal"
        title="案件削除"
        section-title="案件を削除しようとしています"
        :delete-url="NEW_API_ENDPOINTS.customers.cases.delete(customerId, selectedCaseId)"
        success-message="案件を削除しました"
        @close-modal="showCaseDeleteModal = false"
        @refresh="loadCaseData()"
    />
    <ContextMenu
        ref="contextMenu"
        :items="contextMenuItems"
        @item-click="handleContextMenuClick"
    />
  </div>
</template>

<style scoped>
.grid-section {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, 350px);
}

.card-header {
  font-size: 1rem;
  font-weight: bold;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-name {
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-sub-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.category {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #666);
}

.value {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: right;
}

.cycle {
  font-size: 0.85rem;
  font-weight: normal;
  color: var(--color-text-secondary, #666);
}

.date {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
}

.status {
  border-radius: 100px;
  padding: 4px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-progress {
  background-color: var(--color-blue, #3b82f6);
  color: white;
}

.status-estimating {
  background-color: var(--color-emerald, #10b981);
  color: white;
}

.status-completed {
  background-color: var(--color-gray, #6b7280);
  color: white;
}

.status-stopped {
  background-color: var(--color-red, #ef4444);
  color: white;
}

.status-other {
  background-color: var(--color-orange, #f59e0b);
  color: white;
}

.case-link:hover {
  background-color: var(--color-background-hover, #f8fafc);
}
</style>