<script setup lang="ts">
import type {Form} from "~/types/types";
import { useToast } from 'vue-toastification'

const toast = useToast()

// Props定義
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  sectionTitle: {
    type: String,
    required: true
  },
  submitUrl: {
    type: String,
    required: true
  },
  fields: {
    type: Array as PropType<Form[]>,
    required: true
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  successMessage: {
    type: String,
    default: "完了しました"
  },
  errorMessage: {
    type: String,
    default: "失敗しました"
  }
})

const emit = defineEmits<{
  closeModal: [],
  refresh: [],
  'update:formData': [value: any]
}>()

function formatDateToInputValue(dateString: string): string {
  if (!dateString) return '';
  return dateString.replace(/\//g, '-');
}
function formatInputValueToDate(inputValue: string): string {
  if (!inputValue) return '';
  return inputValue.replace(/-/g, '/');
}
function formatDateTimeToInputValue(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
function formatInputValueToDateTime(timeValue: string, fieldName: string): string {
  if (!timeValue) return '';
  const dateStr = form.date;
  if (!dateStr) {
    console.warn(`date field is empty when setting ${fieldName}`);
    return timeValue;
  }
  const datePart = dateStr.replace(/\//g, '-');
  const dateTime = new Date(`${datePart}T${timeValue}:00`);
  if (isNaN(dateTime.getTime())) {
    console.error(`Invalid datetime for ${fieldName}: ${datePart}T${timeValue}:00`);
    return timeValue;
  }
  return dateTime.toISOString();
}

const form = computed({
  get: () => props.formData,
  set: (val) => emit('update:formData', val)
})

async function onSubmit() {
  try {
    const res = await fetchData().fetch(props.submitUrl, "POST", form.value)
    toast.success(props.successMessage);
    emit("closeModal")
    emit("refresh")
  } catch (error) {
    console.error(error)
    toast.error(props.errorMessage)
  }
}

onMounted(() => {
  props.fields.forEach(field => {
    if (form.value[field.name] === undefined) {
      form.value[field.name] = ''
    }
  })
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
              <div
                  v-for="field in fields"
                  :key="field.name"
                  class="form-field"
                  :class="{
                  required: field.required,
                }"
              >
                <label :for="field.name">{{ field.label }}</label>

                <!-- テキスト/数字入力欄 -->
                <div
                    v-if="field.type === 'text' || field.type === 'number' || field.type === 'phone' || field.type === 'website'"
                    class="input-with-button"
                >
                  <input
                      :id="field.name"
                      :type="field.type"
                      :placeholder="field.placeholder"
                      class="form-input"
                      v-model="form[field.name]"
                      :required="field.required"
                  >
                </div>

                <!-- 日付入力欄 -->
                <input
                    v-else-if="field.type === 'date'"
                    :id="field.name"
                    type="date"
                    class="form-input"
                    :value="formatDateToInputValue(form[field.name])"
                    @input="form[field.name] = formatInputValueToDate($event.target.value)"
                    :required="field.required"
                >
                <input
                    v-else-if="field.type === 'datetime'"
                    :id="field.name"
                    type="time"
                    class="form-input"
                    :value="formatDateTimeToInputValue(form[field.name])"
                    @input="form[field.name] = formatInputValueToDateTime($event.target.value, field.name)"
                    :required="field.required"
                >

                <!-- テキストエリア -->
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
                    :item-text="typeof field.options?.[0] === 'string' ? undefined : (item) => item.label"
                    :item-value="typeof field.options?.[0] === 'string' ? undefined : (item) => item.value"
                />
              </div>
            </div>
            <p v-if="description" v-html="description"></p>
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

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

.form-input {
  flex: 1;
}
</style>