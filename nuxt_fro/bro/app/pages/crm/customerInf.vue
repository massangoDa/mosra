<script setup lang="ts">
import {ref} from "vue";
import {useIdStore} from "~/store/idStore";
import {fetchCustomers} from "~/api/customers";
import type {Customer, Contacts} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchContacts} from "~/api/contacts";

const customers = ref<Customer[]>([])

definePageMeta({
  layout: 'crm-layout',
})

async function loadCustomers() {
  try {
    // ココでのfetchCustomersは、api/customersの関数
    customers.value = await fetchCustomers();
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
}


onMounted(() => {
  loadCustomers();
})

const showCustomerInfoModal = ref(false);
const showDeleteInvoiceModal = ref(false);

const selectedCustomerId = ref<string | null>(null)

function openDeleteModal(customerId: string) {
  selectedCustomerId.value = customerId
  showDeleteInvoiceModal.value = true
}


const submitUrl = computed(() =>
    API_ENDPOINTS.customers.create
)
const submitUrl3 = computed(() =>
    API_ENDPOINTS.customers.delete(selectedCustomerId.value)
)

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
      name: 'contact',
      label: '取引先の担当者',
      type: 'select',
      options: [
        { label: '後で作る(連絡先から作成)', value: '' },
          ...contacts.value.map(contact => ({
            label: `${contact.lastName} ${contact.firstName}`,
            value: contact._id,
          }))
      ]
    },
    {
      name: 'description',
      label: '説明',
      type: 'textarea',
      placeholder: '会社の説明や備考を入力',
      rows: '3',
      fullWidth: true
    },
  ]
)

const contextMenu = ref<any>(null);

const contextmenuItems = [
  { id: 'delete', label: '削除' },
];

function handleContextMenuClick(customerId: string, itemId: string) {
  if (itemId === 'delete') {
    openDeleteModal(customerId);
  }
}
</script>

<template>
  <div>
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1>取引先</h1>
        </div>
        <div class="header-right">
          <button @click="showCustomerInfoModal = true" class="NewInfoButton">+ 取引先追加</button>
        </div>
      </div>
      <!--   tableスタイルで行こうぜ   -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th class="sortable">
                取引先名
              </th>
              <th class="sortable">
                電話
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="customer in customers"
              :key="customer._id"
              class="table-row"
              @contextmenu="contextMenu?.openMenu($event, customer._id)"
            >
              <td class="company-name" >
                <NuxtLink :to="`/crm/customer/${customer._id}`" class="link">
                  {{ customer.companyName }}
                </NuxtLink>
              </td>
              <td>
                <a :href="`tel:${ customer.phone || '' }`">{{ customer.phone || '' }}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <TemplateModal
          v-if="showCustomerInfoModal"
          title="取引先情報"
          section-title="取引先を追加"
          :submit-url="submitUrl"
          :fields="customerInfoFields"
          success-message="取引先情報を保存しました"
          @close-modal="showCustomerInfoModal = false"
          @refresh="loadCustomers();"
      />

      <DeleteModal
          v-if="showDeleteInvoiceModal"
          title="取引先情報削除"
          section-title="取引先情報を削除しようとしています"
          :delete-url="submitUrl3"
          success-message="取引先情報を削除しました"
          @close-modal="showDeleteInvoiceModal = false"
          @refresh="loadCustomers();"
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
.NewInfoButton {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.NewInfoButton:hover {
  background-color: #0056b3;
}

.company-name {
  color: #4285f4;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

.link {
  text-decoration: none;
  color: #4285f4;
  transition: background-color 0.3s ease;
}
.link:hover {
  background-color: transparent;
}

.sortable {
  cursor: pointer;
  user-select: none;
}


</style>