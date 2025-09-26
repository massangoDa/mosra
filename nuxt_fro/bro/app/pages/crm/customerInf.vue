<script setup lang="ts">
import Modal from "~/components/Modal.vue";
import {ref} from "vue";

interface Customer {
  CompanyName: string,
  _id: string,
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
      <div class="customerHeader">
        <h1>顧客情報</h1>
        <button @click="show = true" class="NewInfoButton">+ 顧客情報追加</button>
      </div>
      <div class="customers">
        <div
            v-for="customer in customers"
            :key="customer._id"
            class="customer"
        >
          <h3>{{ customer.CompanyName }}</h3>
        </div>
      </div>
      <Modal @closeModal="show = false" v-if="show" />
    </div>
  </div>
</template>

<style scoped>
.customerHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
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


</style>