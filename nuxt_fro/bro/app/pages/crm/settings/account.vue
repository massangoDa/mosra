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
    to: '/crm/settings/account'
  },
  {
    name: 'セキュリティ',
    icon: 'md-lock',
    to: '/crm/settings/security'
  }
]
</script>

<template>
  <PageContainer title="設定" :sidebar="sidebarLink">
    <h2>名前</h2>
    <div class="section">
      <form action="#" class="form">
        <input type="text" />
      </form>
    </div>
  </PageContainer>
</template>

<style scoped>
</style>