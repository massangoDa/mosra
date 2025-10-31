<script setup lang="ts">
import {ref} from "vue";
import GridPageContainer from "~/components/PageContainer.vue";
import '~/assets/css/pages/settings.css'
import PageContainer from "~/components/PageContainer.vue";
import type {loginHistory} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";
import {useToast} from "vue-toastification";

const toast = useToast();

definePageMeta({
  layout: 'crm-layout',
})

const loginHistory = ref<loginHistory[]>([])

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

async function loadLoginHistory() {
  try {
    loginHistory.value = await fetchData().fetch(API_ENDPOINTS.accounts.loginHistory);
  } catch (error) {
    toast.error("ログイン履歴取得でエラーが発生しました")
    console.log(error)
  }
}

onMounted(async () => {
  await loadLoginHistory()
})

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
      <div v-for="login in loginHistory">
        <p>{{ login.loginTime }}</p>
        <p>{{ login.ipAddress }}</p>
        <p>{{ login.device }}</p>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
</style>