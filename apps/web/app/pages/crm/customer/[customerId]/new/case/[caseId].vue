<script setup>
import {ref} from "vue";
import { useToast } from 'vue-toastification'
import {fetchCustomer} from "~/api/customer";
import {fetchTransactions} from "~/api/transactions";
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchInvoice} from "~/api/invoice";
import '~/assets/css/pages/id.css'

definePageMeta({
  layout: 'crm-layout',
})

</script>

<template>
  <div>
    <h1>テスト</h1>
  </div>
</template>
