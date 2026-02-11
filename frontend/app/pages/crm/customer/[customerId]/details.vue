<script setup lang="ts">
import {ref} from "vue";
import type {Contacts, Customer} from "~/types/types";
import {fetchCustomer} from "~/api/customer";
import {useCustomerStore} from "~/store/customer";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";
import {useDataLoader} from "#imports";

definePageMeta({
  layout: 'crm-layout'
})

const customerStore = useCustomerStore()
const contactName = ref<string>('')
const contacts = ref<Contacts[]>([])
const showCustomerEditModal = ref(false)

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

const customerInfoFields = computed(() =>[
      {
        name: 'companyName',
        label: '取引先名',
        type: 'text',
        placeholder: '取引先名を入力',
        required: true,
      },
      {
        name: 'type',
        label: '種別',
        type: 'text',
        placeholder: '種別を入力',
      },
      {
        name: 'category',
        label: 'カテゴリー',
        type: 'select',
        options: [
          "指定なし",
          "アナリスト",
          "競合他社",
          "顧客",
          "システムインテグレーター",
          "投資家",
          "パートナー企業",
          "報道関係者",
          "見込み客",
          "販売代理店",
          "その他"
        ]
      },
      {
        name: 'website',
        label: 'Webサイト',
        type: 'text',
        placeholder: 'https://massango.jp',
      },
      {
        name: 'phone',
        label: '電話番号',
        type: 'phone',
        placeholder: '03-1234-5678'
      },
      {
        name: 'description',
        label: '説明',
        type: 'textarea',
        placeholder: '会社の説明や備考を入力',
        rows: '3',
        fullWidth: true
      }
    ]
)

const hasContacts = computed(() => {
  return contacts.value && contacts.value.length > 0
})

async function loadContactName(contactId: string) {
  try {
    const res = await fetchData().fetch(NEW_API_ENDPOINTS.search.contactName(contactId))
    if (res) {
      contactName.value = `${res.lastName} ${res.firstName || ''}`.trim()
    }
  } catch (error) {
    console.error('Error loading contact name:', error)
  }
}

onMounted(async () => {
  await customerStore.loadCustomer(customerId)
  if (customerStore.customer?.contactId) {
    await loadContactName(customerStore.customer.contactId)
  }
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.contacts(customerId), contacts)
})

</script>

<template>
  <div>
    <PageContainer :title="customerStore.customer?.companyName" :sidebar="sidebarLink">
      <div v-if="!hasContacts" class="make-manager">
        <div class="section">
          <div class="content">
            <div class="message-item">
              <p>顧客情報に担当者を追加しましょう</p>
              <NuxtLink to="/crm/customers" class="action-link">担当者を追加する</NuxtLink>
            </div>
            <div class="message-item">
              <p>担当者の連絡先がありませんか？今すぐ連絡先を追加しましょう</p>
              <NuxtLink to="/crm/contacts" class="action-link">連絡先を追加する</NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="section-header">
        <h2>詳細</h2>
        <button @click="showCustomerEditModal = true" class="NewInfoButton">+ 詳細編集</button>
      </div>

      <div class="section">
        <div class="content">
          <div class="field-row">
            <p class="field-label">取引先名</p>
            <p class="field-value">{{ customerStore.customer?.companyName }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">種別</p>
            <p class="field-value">{{ customerStore.customer?.type }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">カテゴリー</p>
            <p class="field-value">{{ customerStore.customer?.category }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">Webサイト</p>
            <a class="field-value-link" :href="customerStore.customer?.website">{{ customerStore.customer?.website }}</a>
          </div>
          <div class="field-row">
            <p class="field-label">電話番号</p>
            <p class="field-value">{{ customerStore.customer?.phone }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">説明</p>
            <p class="field-value">{{ customerStore.customer?.description }}</p>
          </div>
          <div class="field-row">
            <p class="field-label">担当者</p>
            <p class="field-value">
              {{ contacts.map(contact => `${contact.lastName} ${contact.firstName || ''}`.trim()).join('、') }}
            </p>
          </div>
          <p>担当者を編集したい場合は、<NuxtLink to="/crm/contacts">連絡先</NuxtLink>から操作してください</p>
        </div>
      </div>
    </PageContainer>
  </div>

  <EditModal
      v-if="showCustomerEditModal"
      title="取引先編集"
      section-title="取引先を編集"
      :fetch-url="NEW_API_ENDPOINTS.customers.detail(customerId)"
      :update-url="NEW_API_ENDPOINTS.customers.update(customerId)"
      :fields="customerInfoFields"
      success-message="取引先を更新しました"
      @close-modal="showCustomerEditModal = false"
      @refresh="customerStore.loadCustomer(customerId, true)"
  />
</template>

<style scoped>

</style>