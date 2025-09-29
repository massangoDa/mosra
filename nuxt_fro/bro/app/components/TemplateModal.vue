<script setup lang="ts">
import Toast from 'vue-toastification'
import { useToast } from 'vue-toastification'
import { ref, reactive, onMounted } from "vue";

const toast = useToast()

// Propsの定義
const props = defineProps({
  // モーダルの基本設定から
  title: {
    type: String,
    required: true
  },
  sectionTitle: {
    type: String,
    required: true
  },
  // API関連
  fetchUrl: {
    type: String,
    required: false
  },
  submitUrl: {
    type: String,
    required: true
  },
  // フォームフィールド設定
  fields: {
    type: Array as PropType<FormField[]>,
    required: true
  },
  // 初期データ
  initialData: {
    type: Object,
    default: () => ({})
  },
  // 成功・エラー
  successMessage: {
    type: String,
    default: '保存しました'
  },
  errorMessage: {
    type: String,
    default: '保存に失敗しました'
  },
  // IDの受け渡し
  customerId: {
    type: String,
  },
  invoiceId: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  editTransaction: {
    type: Boolean,
  },
  editInvoice: {
    type: Boolean,
  }
});

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'phone' | 'website' | 'textarea' | 'select' ;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  rows?: number;
  fullWidth?: boolean;
}

const emit = defineEmits<{
  closeModal: []
}>()

const { customerId, invoiceId } = useRoute().params;

const form = reactive<Record<string, any>>({})

// データ初期化
function initializeForm() {
  props.fields.forEach(field => {
    form[field.name] = props.initialData[field.name] || ''
  });
  // invoiceIdがあるなら
  if (props.invoiceId) {
    form.invoiceId = props.invoiceId;
  }
  if (props.transactionId) {
    form._id = props.transactionId;
  }
}

// データ取得
async function fetchFormData() {
  try {
    const res = await fetch(`http://localhost:5000/api${props.fetchUrl}`)
    // フォームに値を設定
    props.fields.forEach(field => {
      form[field.name] = res[field.name] || ''
    })
  } catch (error) {
    console.error(error)
    toast.error(props.errorMessage)
  }
}

// 取引のフォーム初期値を設定する
async function fetchBaseFormData() {
  try {
    const res = await fetchData().fetch(`/api/customer/${customerId}/invoices/${invoiceId}/${props.transactionId}`)

    // フォームの初期値として設定
    form.product = res.product || ''
    form.amount = res.amount || ''
  } catch (error) {
    toast.error('エラー');
    console.error(error)
  }
}

// 請求書のフォーム初期値を設定
async function fetchInvoiceBaseFormData() {
  try {
    const res = await fetchData().fetch(`/api/customer/${props.customerId}/invoices/${props.invoiceId}/info`)

    // フォームの初期値として設定
    form.invoiceNumber = res.invoiceNumber || ''
    form.totalAmount = res.totalAmount || ''
    form.invoiceRequest = res.invoiceRequest || ''
    form.invoiceStatus = res.invoiceStatus || ''
  } catch (error) {
    toast.error('エラー');
    console.error(error)
  }
}

// 送信処理
async function onSubmit() {
  console.log(form)
  console.log(props.submitUrl)
  try {
    const res = await $fetch(`http://localhost:5000/api${props.submitUrl}`, {
      method: 'POST',
      body: form,
      headers: {
        Authorization: `Bearer ${useAuth().authToken.value}`
      },
    })
    toast.success(props.successMessage)
    emit("closeModal")
  } catch (error) {
    console.error(error)
    toast.error(props.errorMessage)
  }
}

onMounted(() => {
  initializeForm()
  if (props.fetchUrl) {
    fetchFormData()
  }
  if (props.editTransaction) {
    fetchBaseFormData()
  }
  if (props.editInvoice) {
    fetchInvoiceBaseFormData()
  }
})
</script>

<template>
  <div class="modal">
    <div class="modal-wrap">
      <div class="modal-header">
        <h2>{{ title }}</h2>
      </div>
      <div class="modal-content">
        <form @submit.prevent="onSubmit" class="customer-form">
          <section class="form-section">
            <h3 class="section-title">{{ sectionTitle }}</h3>
            <div class="form-grid">
              <!--      動的フォームフィールド        -->
              <div
                v-for="field in fields"
                :key="field.name"
                class="form-field"
                :class="{
                  required: field.required,
                  'full-width': field.fullWidth
                }"
              >
                <label :for="field.name">{{ field.label }}</label>

                <!-- テキスト/数字入力欄 -->
                <input
                  v-if="field.type === 'text' || field.type === 'number' || field.type === 'phone' || field.type === 'website' "
                  :id="field.name"
                  :type="field.type"
                  :placeholder="field.placeholder"
                  class="form-input"
                  v-model="form[field.name]"
                  :required="field.required"
                >

                <textarea
                  v-else-if="field.type === 'textarea'"
                  :id="field.name"
                  :placeholder="field.placeholder"
                  :rows="field.rows || 3"
                  class="form-textarea"
                  v-model="form[field.name]"
                  :required="field.required"
                ></textarea>

                <!-- セレクトボックス -->
                <Combobox
                  v-else-if="field.type === 'select'"
                  :id="field.name"
                  v-model="form[field.name]"
                  :items="field.options"
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