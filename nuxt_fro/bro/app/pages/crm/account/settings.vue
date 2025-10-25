<script setup lang="ts">
import {ref} from "vue";
import GridPageContainer from "~/components/PageContainer.vue";
import '~/assets/css/pages/settings.css'
import PageContainer from "~/components/PageContainer.vue";

definePageMeta({
  layout: 'crm-layout',
})

const sidebarLink = [
  {
    name: 'アカウント',
    icon: 'md-accountcircle',
    to: '#'
  }
]
</script>

<template>
  <PageContainer title="設定" :sidebar="sidebarLink">
    <p>名前</p>
    <input type="text" />
    <p>メールアドレス</p>
    <input type="email">
    <p>パスワード</p>
    <input type="password" />
  </PageContainer>
</template>

<style scoped>

</style>