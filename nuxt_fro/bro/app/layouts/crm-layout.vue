<script setup lang="ts">
import '~/assets/css/crm.css'

const { userInfo, loading, fetchUserInfo, authToken, logout } = useAuth()

const handleLogout = async () => {
  await logout()
}

// authTokenの変化を監視するしか俺には道はない
watch(authToken, async (newToken) => {
  if (newToken && !userInfo.value) {
    await fetchUserInfo()
  }
}, {
  immediate: true,
})
</script>

<template>
  <div class="app-wrapper">
    <div class="main-area">
      <!--   サイドバー(左)   -->
      <nav class="sidebar">
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-dashboard" class="sidebar-link-icon"/>Dashboard</NuxtLink>
        <NuxtLink to="/crm/customerInf" class="sidebar-link"><v-icon name="md-info" class="sidebar-link-icon"/>顧客情報</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-handshake" class="sidebar-link-icon"/>商談・案件</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="bi-calendar-event" class="sidebar-link-icon"/>スケジュール</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-message" class="sidebar-link-icon"/>メッセージ</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-analytics" class="sidebar-link-icon"/>分析</NuxtLink>
        <div class="logout" @click="handleLogout">
          <div class="sidebar-link">
            <v-icon name="md-logout" class="sidebar-link-icon"/>
            {{ loading ? 'ログアウト中...' : 'Logout' }}
          </div>
        </div>
      </nav>
      <!--   メインコンテンツ　  -->
      <main class="main-content">
        <div class="account">
          <p>{{ userInfo?.name }}</p>
        </div>
        <slot />
      </main>
    </div>
  </div>
</template>

<style>
#__nuxt {
  max-width: 100%;
  margin: 0;
  padding:  0;
  font-weight: normal;
}

.logout {
  cursor: pointer;
}
</style>