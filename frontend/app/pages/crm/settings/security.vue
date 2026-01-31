<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, type Ref } from 'vue'
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
const hasOuterSidebar = inject<Ref<boolean> | null>('hasInnerSidebar', null)

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

onMounted(async () => {
  await useDataLoader().loadData(API_ENDPOINTS.accounts.loginHistory, loginHistory)

  if (hasOuterSidebar) {
    hasOuterSidebar.value = true
  }
})

onUnmounted(() => {
  if (hasOuterSidebar) {
    hasOuterSidebar.value = false
  }
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
      <div v-for="login in loginHistory.slice(0, 5)" class="item">
        <v-icon :name="login.device === 'Windows' ? 'md-desktopwindows' :
                 login.device === 'Mac' ? 'md-desktopmac' :
                 login.device === 'Linux' ? 'md-devicesother' :
                 'md-desktopwindows'"
                class="icon"
        />
        <p>{{ useFormat().formatDate(login.loginTime) }}</p>
        <p>{{ login.ipAddress }}</p>
        <p>{{ login.device }}</p>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  padding: 8px;
  background-color: var(--color-input-background);
  border-radius: 8px;
  color: var(--color-info-label);
}

.item p {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

.item p:nth-of-type(1) {
  flex: 1;
  font-weight: 600;
  color: var(--color-text);
}

.item p:nth-of-type(2) {
  flex: 1;
  color: var(--color-text-secondary);
  font-family: 'Courier New', monospace;
}

.item p:nth-of-type(3) {
  flex: 0 0 auto;
  padding: 4px 12px;
  background-color: var(--color-input-background);
  border-radius: 4px;
  color: var(--color-text-secondary);
    font-size: 1rem;
}
</style>