<script setup lang="ts">
import '~/assets/css/pages/id.css'
import {useCustomerStore} from "~/store/customer";
import {API_ENDPOINTS} from "~/api/endpoints";
import type {Case, Transaction} from "~/types/types";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";
import {useCaseStore} from "~/store/case";
import {useToast} from "vue-toastification";

definePageMeta({
  layout: 'crm-layout'
})

const customerStore = useCustomerStore()
const caseStore = useCaseStore()
const transaction = ref<Transaction[]>([])

const toast = useToast()

const { customerId, caseId, invoiceId } = useRoute().params;

const sidebarLink = [
  {
    name: '案件に戻る',
    icon: 'md-keyboardreturn',
    to: `/crm/customer/${customerId}/case/${caseId}`
  },
  {
    name: '請求書',
    icon: 'md-eventrepeat',
    to: `/crm/customer/${customerId}/case/${caseId}/invoice/${invoiceId}`
  }
]

const contextMenu = ref<any>(null)
const contextMenuItems = [
  { id: 'edit', label: '編集' }
]
function handleContextMenuClick(transactionId: string, itemId: string) {
  if (itemId === 'edit') {
    const target = transaction.value.find(t => t._id === transactionId)
    if (target) {
      editingId.value = target._id
      editForm.value = { ...target }
    }
  }
}

const defaultNewItem = {
  product: '',
  amount: 0,
  cost: 0,
  tax_rate: 10,
}
const newItem = ref({ ...defaultNewItem })
const editingId = ref<string | null>(null)
const editForm = ref({ ...defaultNewItem })
const isAdding = ref(false)

const startAdding = () => {
  isAdding.value = true
  newItem.value = { ...defaultNewItem }
}

const saveTransaction = async () => {
  if (!newItem.value.product) {
    toast.error('製品名を入力してください')
    return
  }

  await fetchData().fetch(NEW_API_ENDPOINTS.customers.cases.invoices.transactions.create(customerId, caseId, invoiceId), 'POST', newItem.value)

  transaction.value.push({ ...newItem.value })
  isAdding.value = false

  toast.success('取引情報を保存しました')
}

const updateTransaction = async () => {
  if (!editForm.value.product) {
    toast.error('製品名を入力してください')
    return
  }

  await fetchData().fetch(NEW_API_ENDPOINTS.customers.cases.invoices.transactions.update(customerId, caseId, invoiceId, editingId.value), 'PUT', editForm.value)

  const index = transaction.value.findIndex(t => t._id === editingId.value)
  transaction.value[index] = { ...editForm.value }
  editingId.value = null

  toast.success('取引情報を更新しました')
}

const cancelAdding = () => {
  isAdding.value = false
}

const totalAmount = computed(() => {
  return transaction.value.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const totalTax = computed(() => {
  return transaction.value.reduce((sum, item) => sum + (item.amount * item.tax_rate / 100), 0)
})

const grandTotal = computed(() => {
  return totalAmount.value + totalTax.value
})

onMounted(async() => {
  await customerStore.loadCustomer(customerId)
  await caseStore.loadCase(customerId, caseId)
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.invoices.transactions.list(customerId, caseId, invoiceId), transaction)
})
</script>

<template>
  <PageContainer :title="`${customerStore.customer?.companyName} - ${caseStore.caseData?.caseName}`" :sidebar="sidebarLink">
    <div class="section">
      <div class="content">
        <div class="table-container">
          <table class="table">
            <thead>
            <tr>
              <th class="sortable">ID</th>
              <th class="sortable">製品名</th>
              <th class="sortable">金額</th>
              <th class="sortable">原価</th>
              <th class="sortable">税額</th>
              <th class="sortable">税率</th>
              <td class="sortable">操作</td>
            </tr>
            </thead>
            <tbody>
              <template v-for="(transact, index) in transaction" :key="transact._id">
                <tr v-if="editingId === transact._id" class="table-row">
                  <td>{{ index + 1 }}</td>
                  <td><input v-model="editForm.product" class="edit-input" @keydown.enter="" /></td>
                  <td><input v-model.number="editForm.amount" type="number" class="edit-input" /></td>
                  <td><input v-model.number="editForm.cost" type="number" class="edit-input" /></td>
                  <td>{{editForm.amount*editForm.tax_rate/100}}</td>
                  <td><input v-model.number="editForm.tax_rate" type="number" class="edit-input" /></td>
                  <td class="edit-actions">
                    <button @click="updateTransaction" class="save-button">保存</button>
                    <button @click="editingId = null" class="cancel-button">取消</button>
                  </td>
                </tr>
                <tr v-else class="table-row" @contextmenu="contextMenu?.openMenu($event, transact._id)">
                  <td>{{ index + 1 }}</td>
                  <td class="product">{{ transact.product }}</td>
                  <td class="amount">{{ useFormat().formatCurrency(transact.amount) }}</td>
                  <td>{{ useFormat().formatCurrency(transact.cost) }}</td>
                  <td>{{ useFormat().formatCurrency(transact.amount*transact.tax_rate/100) }}</td>
                  <td>{{ transact.tax_rate }} %</td>
                </tr>
              </template>

              <tr v-if="isAdding" class="adding-row">
                <td></td>
                <td><input v-model="newItem.product" class="edit-input" placeholder="製品名" @keydown.enter="saveTransaction" autofocus /></td>
                <td><input v-model.number="newItem.amount" type="number" class="edit-input" @keydown.enter="saveTransaction" /></td>
                <td><input v-model.number="newItem.cost" type="number" class="edit-input" @keydown.enter="saveTransaction" /></td>
                <td>{{ (newItem.amount * newItem.tax_rate / 100).toLocaleString() }}</td>
                <td><input v-model.number="newItem.tax_rate" type="number" class="edit-input" @keydown.enter="saveTransaction" /></td>
                <td>
                  <div class="edit-actions">
                    <button @click="saveTransaction" class="save-button">保存 (Enter)</button>
                    <button @click="cancelAdding" class="cancel-button">キャンセル (Esc)</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="table-actions">
            <button v-if="!isAdding" @click="startAdding" class="add-button">+ 行を追加</button>
          </div>

          <div class="invoice-summary">
            <div class="summary-row">
              <span class="label">小計</span>
              <span class="value">{{ useFormat().formatCurrency(totalAmount) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">消費税</span>
              <span class="value">{{ useFormat().formatCurrency(totalTax) }}</span>
            </div>
            <div class="summary-row total">
              <span class="label">合計</span>
              <span class="value">{{ useFormat().formatCurrency(grandTotal) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
  <ContextMenu
      ref="contextMenu"
      :items="contextMenuItems"
      @item-click="handleContextMenuClick"
  />
</template>

<style scoped>
.edit-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-link);
  background: transparent;
  color: inherit;
  font-size: 0.9rem;
  outline: none;
}

.add-button {
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  border: 2px dashed var(--color-border);
  background: transparent;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.add-button:hover {
  background-color: var(--color-background-hover-secondary);
  color: var(--color-link);
}

.save-button {
  margin: 8px;
  padding: 8px;
  border-radius: 8px;
  background: var(--color-button-background);
  color: white;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
}
.save-button:hover {
  background-color: var(--color-button-background-hover);
}

.cancel-button {
  margin: 10px;
  padding: 4px;
  border-radius: 8px;
}

.invoice-summary {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 20px;
  border-top: 1px solid var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  width: 300px;
  margin-bottom: 8px;
}
.summary-row.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
  font-weight: bold;
  font-size: 1.2rem;
}

.label {
  color: var(--color-text-secondary);
}
</style>