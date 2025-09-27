<script setup lang="ts">
// Comboboxコンポーネントをインポート
import Toast from 'vue-toastification'
import { useToast } from 'vue-toastification'
import {ref} from "vue";

const toast = useToast()

const items = ['完了', '取引中', '停滞中']

const props = defineProps({
  transactionId: {
    type: [String],
    required: true,
    default: '',
  }
});

interface Transaction {
  product: string,
  amount: number,
  transactionStatus: string,
  _id: string,
}

const transaction = ref<Transaction | null>(null)

// 送るデータ
const form = reactive({
  product: '',
  amount: '',
  transactionStatus: '完了',
  _id: props.transactionId,
})

const emit = defineEmits<{
  closeModal: []
}>()

const { id } = useRoute().params;

async function onSubmit() {
  try {
    const res = await $fetch(`http://localhost:5000/api/customer/${id}/transactions/edit/${props.transactionId}`, {
      method: 'POST',
      body: form,
      headers: {
        Authorization: `Bearer ${useAuth().authToken.value}`
      }
    })

    toast.success('取引を編集しました！')
    emit('closeModal')
  } catch (error) {
    toast.error('編集に失敗しました')
  }
}

async function fetchTransactions() {
  try {
    const res = await fetchData().fetch(`/api/customer/${id}/transactions/${props.transactionId}`);

    transaction.value = {
      product: res.product,
      amount: res.amount,
      transactionStatus: res.transactionStatus
    }

    // フォームの初期値として設定
    form.product = res.product || ''
    form.amount = res.amount || ''
    form.transactionStatus = res.transactionStatus || '完了'
  } catch (error) {
    console.log(error)
    toast.error("エラーが発生")
  }
}

onMounted(() => {
  fetchTransactions()
})
</script>

<template>
  <div class="modal">
    <div class="modal-wrap">
      <div class="modal-header">
        <h2>取引情報編集</h2>
      </div>
      <div class="modal-content">
        <form @submit.prevent="onSubmit" class="customer-form">
          <!--    なまがわき    -->
          <section class="form-section">
            <h3 class="section-title">取引情報を編集</h3>
            <div class="form-grid">
              <div class="form-field required">
                <label for="product">製品名</label>
                <input
                    id="product"
                    type="text"
                    placeholder="製品名を入力"
                    class="form-input"
                    v-model="form.product"
                    required
                >
              </div>

              <div class="form-field">
                <label for="amount">金額</label>
                <input
                    id="type"
                    type="number"
                    placeholder="金額を入力(数字のみ)"

                    v-model="form.amount"
                    class="form-input"
                >
              </div>

              <div class="form-field">
                <label for="transactionStatus">ステータス</label>
                <Combobox
                    id="transactionStatus"
                    v-model="form.transactionStatus"
                    :items="items"
                />
              </div>
            </div>
          </section>
          <div class="form-actions">
            <button type="button" @click="$emit('closeModal')" class="btn btn-secondary">
              キャンセル
            </button>
            <button type="submit" class="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-wrap {
  background-color: #fff;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  padding-bottom: 16px;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 0 24px 24px;
  overflow-y: auto;
  max-height: calc(90vh - 100px);
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
}
.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field.required label::after {
  content: " *";
  color: #ef4444;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 8px 0 8px 0;
  display: block;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.2s ease;
  background-color: #fff;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  min-width: 100px;
}

.btn-secondary {
  background-color: #fff;
  color: #6b7280;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  color: #374151;
}

.btn-primary {
  background-color: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background-color: #2563eb;
}

</style>