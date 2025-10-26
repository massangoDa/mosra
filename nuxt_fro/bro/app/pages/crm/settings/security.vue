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
    <h2>パスワード</h2>
    <div class="section">
      <!--   パスワード変更ボタンを付ける   -->
      <form action="#" class="form">
        <input type="password" />
      </form>
    </div>

    <h2>ログイン履歴</h2>
    <div class="section">
      <p>なし</p>
    </div>
  </PageContainer>
</template>

<style scoped>
</style>