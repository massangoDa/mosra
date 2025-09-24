<script setup lang="ts">
import Modal from "~/components/Modal.vue";

definePageMeta({
  layout: 'crm-layout',
})

const show = ref(false);
</script>

<template>
<div>
  <h1>顧客情報</h1>
  <button @click="show = true">+ 顧客情報追加</button>
  <Modal @closeModal="show = false" v-if="show" />
</div>
</template>

<style scoped>

</style>