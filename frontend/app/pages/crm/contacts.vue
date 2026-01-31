<script setup lang="ts">
import {ref} from "vue";
import {useIdStore} from "~/store/idStore";
import {fetchCustomers} from "~/api/customers";
import type {Contacts, Customer} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchContacts} from "~/api/contacts";

const contacts = ref<Contacts[]>([])
const companyNames = ref<Record<string, string>>({});

definePageMeta({
  layout: 'crm-layout',
})

const showContactInfoModal = ref(false);
const showEditContactModal = ref(false);

const showDeleteContactModal = ref(false);
const selectedContactId = ref<string | null>(null)
function openEditModal(contactId: string) {
  selectedContactId.value = contactId
  showEditContactModal.value = true
}

function openDeleteModal(contactId: string) {
  selectedContactId.value = contactId
  showDeleteContactModal.value = true
}

const submitUrl = computed(() =>
    API_ENDPOINTS.contacts.create
)

const editContactUrl = computed(() =>
    selectedContactId.value
        ? API_ENDPOINTS.contacts.update(selectedContactId.value)
        : ""
)


const deleteContactUrl = computed(() =>
    API_ENDPOINTS.contacts.delete(selectedContactId.value)
)
const customerInfoFields = computed(() =>[
    {
      name: 'lastName',
      label: '姓',
      type: 'text',
      placeholder: '',
      required: true,
    },
    {
      name: 'firstName',
      label: '名',
      type: 'text',
      placeholder: '',
    },
    {
      name: 'email',
      label: 'メール',
      type: 'text',
      placeholder: '',
    },
    {
      name: 'phone',
      label: '電話番号',
      type: 'phone',
      placeholder: ''
    },
    {
      name: 'notes',
      label: '備考',
      type: 'textarea',
      placeholder: '',
      rows: '3',
      fullWidth: true
    },
  ]
)
const contextMenu = ref<any>(null);

const contextmenuItems = [
  { id: 'edit', label:'編集' },
  { id: 'delete', label: '削除' },
];

function handleContextMenuClick(contactId: string, itemId: string) {
  if (itemId === 'delete') {
    openDeleteModal(contactId);
  } else if (itemId === 'edit') {
    openEditModal(contactId);
  }
}

async function loadContacts() {
  try {
    contacts.value = await fetchContacts();
    for (const contact of contacts.value) {
      if (contact.customerId && !companyNames.value[contact.customerId]) {
        await loadCompanyName(contact.customerId);
      }
    }
  } catch (error) {
    console.error('連絡先でエラー:', error);
  }
}

async function loadCompanyName(customerId: string) {
  try {
    const res = await fetchData().fetch(API_ENDPOINTS.search.companyName(customerId))
    companyNames.value[customerId] = res?.companyName || '';
  } catch (error) {
    console.error('Error fetching company name:', error);
  }
}

onMounted(async () => {
  await loadContacts();
})
</script>

<template>
  <div>
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1>連絡先</h1>
        </div>
        <div class="header-right">
          <button @click="showContactInfoModal = true" class="NewInfoButton">+ 連絡先追加</button>
        </div>
      </div>
      <!--   tableスタイルで行こうぜ   -->
      <div class="table-container">
        <table class="table">
          <thead>
          <tr>
            <th class="sortable">
              連絡先名
            </th>
            <th class="sortable">
              取引先名
            </th>
            <th class="sortable">
              メール
            </th>
            <th class="sortable">
              電話番号
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="contact in contacts"
              :key="contact._id"
              class="table-row"
              @contextmenu="contextMenu?.openMenu($event, contact._id)"
          >
            <td>
              {{ contact.lastName }} {{ contact.firstName || '' }}
            </td>
            <td class="company-name">
              <NuxtLink :to="`/crm/customer/${contact.customerId}/details`" class="company-name">
                {{ companyNames[contact.customerId] || '読み込み中' }}
              </NuxtLink>
            </td>
            <td>
              <a :href="`mailto:${ contact.email || '' }`">{{ contact.email || '' }}</a>
            </td>
            <td>
              <a :href="`tel:${ contact.phone || '' }`">{{ contact.phone || '' }}</a>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <TemplateModal
          v-if="showContactInfoModal"
          title="連絡先情報"
          section-title="連絡先を追加"
          :submit-url="submitUrl"
          :fields="customerInfoFields"
          success-message="連絡先情報を保存しました"
          @close-modal="showContactInfoModal = false"
          @refresh="loadContacts();"
      />

      <TemplateModal
          v-if="showEditContactModal"
          title="連絡先修正"
          section-title="連絡先情報を修正"
          :update-url="editContactUrl"
          :fields="customerInfoFields"
          success-message="連絡先情報を保存しました"
          @close-modal="showEditContactModal = false"
          :contactId="selectedContactId"
          :editTransaction="true"
          @refresh="loadContacts"
      />

      <DeleteModal
          v-if="showDeleteContactModal"
          title="連絡先情報削除"
          section-title="連絡先情報を削除しようとしています"
          :delete-url="deleteContactUrl"
          success-message="連絡先情報を削除しました"
          @close-modal="showDeleteContactModal = false"
          @refresh="loadContacts();"
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
</style>