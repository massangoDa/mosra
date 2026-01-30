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
const isAdding = ref(false)
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

const defaultNewItem = {
  product: '',
  amount: 0,
  cost: 0,
  tax_rate: 10,
}
const newItem = ref({ ...defaultNewItem })

const startAdding = () => {
  isAdding.value = true
  newItem.value = { ...defaultNewItem }
}

const saveTransaction = async () => {
  if (!newItem.value.product) return

  await fetchData().fetch(NEW_API_ENDPOINTS.customers.cases.invoices.transactions.create(customerId, caseId, invoiceId), 'POST', JSON.stringify(newItem.value))

  transaction.value.push({ ...newItem.value })
  isAdding.value = false

  toast.success('取引情報を保存しました')
}

const cancelAdding = () => {
  isAdding.value = false
}

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
              <th class="sortable">製品名</th>
              <th class="sortable">金額</th>
              <th class="sortable">原価</th>
              <th class="sortable">税額</th>
              <th class="sortable">税率</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="transact in transaction" :key="transact._id" class="table-row">
              <td class="product">{{ transact.product }}</td>
              <td class="amount">{{ useFormat().formatCurrency(transact.amount) }}</td>
              <td>{{ useFormat().formatCurrency(transact.cost) }}</td>
              <td>{{ useFormat().formatCurrency(transact.amount*transact.tax_rate/100) }}</td>
              <td>{{ transact.tax_rate }} %</td>
            </tr>

            <tr v-if="isAdding" class="adding-row">
              <td>
                <input v-model="newItem.product" class="edit-input" placeholder="製品名" @keydown.enter="saveTransaction" autofocus />
              </td>
              <td>
                <input v-model.number="newItem.amount" type="number" class="edit-input" @keydown.enter="saveTransaction" />
              </td>
              <td>
                <input v-model.number="newItem.cost" type="number" class="edit-input" @keydown.enter="saveTransaction" />
              </td>
              <td>
                {{ (newItem.amount * newItem.tax_rate / 100).toLocaleString() }}
              </td>
              <td>
                <input v-model.number="newItem.tax_rate" type="number" class="edit-input" @keydown.enter="saveTransaction" />
              </td>
            </tr>
            </tbody>
          </table>

          <div class="table-actions">
            <button v-if="!isAdding" @click="startAdding" class="add-button">+ 行を追加</button>
            <div v-else class="edit-actions">
              <button @click="saveTransaction" class="save-button">保存 (Enter)</button>
              <button @click="cancelAdding" class="cancel-button">キャンセル (Esc)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
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
</style>