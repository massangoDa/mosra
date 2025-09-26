<script setup lang="ts">
import Modal from "~/components/Modal.vue";
import {ref} from "vue";

interface Customer {
  CompanyName: string,
  _id: string,
  phone?: string,
}

const customers = ref<Customer[]>([])

definePageMeta({
  layout: 'crm-layout',
})

async function fetchCustomers() {
  try {
    const res = await $fetch('http://localhost:5000/api/customers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${useAuth().authToken.value}`,
      }
    });

    customers.value = res.map((customer: any) => ({
      CompanyName: customer.CompanyName,
      _id: customer._id,
      phone: customer.phone,
    }))

  } catch (error) {
    console.error('Error fetching customers:', error);
  }
}

onMounted(() => {
  fetchCustomers();
})

const show = ref(false);
</script>

<template>
  <div>
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1>顧客情報</h1>
        </div>
        <div class="header-right">
          <button @click="show = true" class="NewInfoButton">+ 顧客情報追加</button>
        </div>
      </div>
      <!--   tableスタイルで行こうぜ   -->
      <div class="table-container">
        <table class="customer-table">
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
              class="customer-row"
            >
              <td class="company-name">
                {{ customer.CompanyName }}
              </td>
              <td>
                {{ customer.phone || '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Modal @closeModal="show = false" v-if="show" />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background-color: #f8f9fa;
  padding: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  align-items: center;
}
.header-right {
  display: flex;
  gap: 8px;
}


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

.table-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  overflow: hidden;
  min-height: 0;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
}
.customer-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.customer-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  position: relative;
}

.customer-row {
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s ease;
}
.customer-row:hover {
  background-color: #f8f9fa;
}

.customer-table td {
  padding: 12px 16px;
  font-size: 0.9rem;
  vertical-align: middle;
}

.company-name {
  color: #4285f4;
  font-weight: 500;
  cursor: pointer;
}
.company-name:hover {
  text-decoration: underline;
}

.sortable {
  cursor: pointer;
  user-select: none;
}


</style>