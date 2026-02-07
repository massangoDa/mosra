<script setup lang="ts">
import {useToast} from "vue-toastification";

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
  deleteUrl: {
    type: String,
    required: false
  },
  // 成功・エラー
  successMessage: {
    type: String,
    default: '削除しました'
  },
  errorMessage: {
    type: String,
    default: '削除に失敗しました'
  },
});

const emit = defineEmits<{
  closeModal: [],
  refresh: []
}>()

// 削除処理
async function onSubmit() {
  try {
    console.log(props.deleteUrl)
    await fetchData().fetch(`${props.deleteUrl}`, "DELETE")
    toast.success(props.successMessage);
    emit("closeModal")
    emit("refresh")
  } catch (error) {
    console.error(error)
    toast.error(props.errorMessage)
  }
}
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
          </section>
          <div class="form-actions">
            <button type="button" @click="$emit('closeModal')" class="btn btn-secondary">
              キャンセル
            </button>
            <button type="submit" class="btn btn-primary">
              削除
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
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-wrap {
  background-color: #fff;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #fee2e2;
  text-align: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #b91c1c;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: #fef2f2;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #b91c1c;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.btn-primary {
  background-color: #dc2626;
  color: #fff;
}

.btn-primary:hover {
  background-color: #b91c1c;
}

.warning-text {
  font-size: 1rem;
  color: #b91c1c;
  text-align: center;
  margin-bottom: 16px;
}
</style>