<script setup lang="ts">
import '~/assets/css/crm.css'
</script>

<template>
  <div class="app-wrapper">
    <div class="main-area">
      <!--   サイドバー(左)   -->
      <nav class="sidebar">
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-dashboard" class="sidebar-link-icon"/>Dashboard</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-info" class="sidebar-link-icon"/>顧客情報</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-handshake" class="sidebar-link-icon"/>商談・案件</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="bi-calendar-event" class="sidebar-link-icon"/>スケジュール</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-message" class="sidebar-link-icon"/>メッセージ</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-analytics" class="sidebar-link-icon"/>分析</NuxtLink>
        <div class="logout">
          <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-logout" class="sidebar-link-icon"/>Logout</NuxtLink>
        </div>
      </nav>
      <!--   メインコンテンツ　  -->
      <main class="main-content">
        <div class="account">
          <p>massango</p>
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
</style>