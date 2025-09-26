<script setup lang="ts">
// Comboboxコンポーネントをインポート
import Combobox from '~/components/Combobox.vue'

const items = ['--なし--', 'Analyst', 'Competitor', 'Customer', 'Integrator', 'Investor', 'Partner', 'Press', 'Prospect', 'Reseller', 'Other']

// 送るデータ
const form = reactive({
  companyName: '',
  type: '',
  category: '--なし--',
  website: '',
  phone: '',
  description: '',
  address: {
    postalCode: '',
    prefecture: '',
    detail: ''
  }
})

defineEmits<{
  closeModal: []
}>()

async function onSubmit() {
  const res = await $fetch('http://localhost:5000/api/customer', {
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${useAuth().authToken.value}`
    }
  })
}
</script>

<template>
  <div class="modal">
    <div class="modal-wrap">
      <div class="modal-header">
        <h2>顧客情報</h2>
      </div>
      <div class="modal-content">
        <form @submit.prevent="onSubmit" class="customer-form">
          <!--    なまがわき    -->
          <section class="form-section">
            <h3 class="section-title">顧客情報を追加</h3>
            <div class="form-grid">
              <div class="form-field required">
                <label for="company-name">取引先名</label>
                <input
                    id="company-name"
                    type="text"
                    placeholder="取引先名を入力"
                    class="form-input"
                    v-model="form.companyName"
                    required
                >
              </div>

              <div class="form-field">
                <label for="type">種別</label>
                <input
                    id="type"
                    type="text"
                    placeholder="種別を入力"
                    v-model="form.type"
                    class="form-input"
                >
              </div>

              <div class="form-field">
                <label for="category">カテゴリー</label>
                <Combobox
                    id="category"
                    v-model="form.category"
                    :items="items"
                />

                <div class="form-field">
                  <label for="website">Webサイト</label>
                  <input
                      id="website"
                      type="url"
                      placeholder="https://massango.jp"
                      v-model="form.website"
                      class="form-input"
                  />
                </div>

                <div class="form-field">
                  <label for="phone">電話番号</label>
                  <input
                      id="phone"
                      type="tel"
                      placeholder="03-1234-5678"
                      v-model="form.phone"
                      class="form-input"
                  >
                </div>

                <div class="form-field full-width">
                  <label for="description">説明</label>
                  <textarea
                      id="description"
                      placeholder="会社の説明や備考を入力"
                      rows="3"
                      v-model="form.description"
                      class="form-textarea"
                  ></textarea>
                </div>
              </div>
            </div>
          </section>

        <!--     なんだもう朝かと     -->
          <section class="form-section">
            <h3 class="section-title">住所情報</h3>
            <div class="form-grid">
              <div class="form-field">
                <label for="postal-code">郵便番号</label>
                <input
                    id="postal-code"
                    type="text"
                    placeholder="123-4567"
                    v-model="form.address.postalCode"
                    class="form-input"
                    maxlength="8"
                >
              </div>

              <div class="form-field">
                <label for="prefecture">都道府県</label>
                <input
                    id="prefecture"
                    type="text"
                    placeholder="東京都"
                    class="form-input"
                    v-model="form.address.prefecture"
                >
              </div>

              <div class="form-field full-width">
                <label for="address">住所</label>
                <input
                    id="address"
                    type="text"
                    placeholder="市区町村以降の住所を入力"
                    class="form-input"
                    v-model="form.address.detail"
                >
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