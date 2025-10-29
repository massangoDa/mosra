<script setup lang="ts">
import '~/assets/css/crm.css'

const { userInfo, loading, fetchUserInfo, authToken, logout } = useAuth()

// ダークモード管理
const isDark = ref(false)

const isMenuOpen = ref(false)

// 初期化時にlocalStorageから読み込み、なければシステム設定を使用
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateTheme()
})

// テーマ切り替え関数
const toggleTheme = () => {
  isDark.value = !isDark.value
  updateTheme()
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// HTMLタグにクラスを追加/削除
const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

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

// 検索の話
const showSearch = ref(false);

function handleKeyDown(event: KeyboardEvent) {
  if ((event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    showSearch.value = true;
  }

  if (event.key === 'Escape') {
    showSearch.value = false;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
})


</script>

<template>
  <div class="app-wrapper">
    <div class="main-area">
      <!--   サイドバー(左)   -->
      <nav class="sidebar">
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-dashboard" class="sidebar-link-icon"/>ダッシュボード</NuxtLink>
        <div class="menu-item-has-children" :class="{ open: isMenuOpen }">
          <NuxtLink to="" class="sidebar-link" @click="isMenuOpen = !isMenuOpen">
            <v-icon name="md-info" class="sidebar-link-icon"/>顧客情報
            <v-icon name="oi-chevron-up" class="chevron-icon"/>
          </NuxtLink>
          <ul class="sub-menu">
            <li><NuxtLink to="/crm/contacts" class="sidebar-link"><v-icon name="md-permcontactcalendar" class="sidebar-link-icon" />連絡先</NuxtLink></li>
            <li><NuxtLink to="/crm/customerInf" class="sidebar-link"><v-icon name="md-corporatefare" class="sidebar-link-icon" />取引先</NuxtLink></li>
          </ul>
        </div>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-handshake" class="sidebar-link-icon"/>商談・案件</NuxtLink>
        <NuxtLink to="/crm/calendar" class="sidebar-link"><v-icon name="bi-calendar-event" class="sidebar-link-icon"/>カレンダー</NuxtLink>
        <NuxtLink to="/crm/dashboard" class="sidebar-link"><v-icon name="md-message" class="sidebar-link-icon"/>メッセージ</NuxtLink>
        <NuxtLink to="/crm/analysis" class="sidebar-link"><v-icon name="md-analytics" class="sidebar-link-icon"/>分析</NuxtLink>
        <div class="logout">
          <NuxtLink to="/crm/settings/account" class="sidebar-link"><v-icon name="md-settings" class="sidebar-link-icon"/>設定</NuxtLink>
          <div class="sidebar-link" @click="handleLogout">
            <v-icon name="md-logout" class="sidebar-link-icon"/>
            {{ loading ? 'ログアウト中...' : 'Logout' }}
          </div>
        </div>
      </nav>
      <!--   メインコンテンツ　  -->
      <main class="main-content">
        <div class="search">
          <button @click="showSearch = true" class="search-trigger">
            <v-icon name="io-search" />
            <span>検索</span>
          </button>
        </div>
        <div class="top-controls">
          <button @click="toggleTheme" class="theme-toggle">
            <v-icon :name="isDark ? 'md-sunny' : 'md-darkmode'" />
          </button>
          <div class="account">
            <p> <v-icon name="md-accountbox" class="icon"/> {{ userInfo?.name }}</p>
          </div>
        </div>
        <slot />
      </main>
      <!-- 検索モーダル -->
      <Search
          v-if="showSearch"
          @close="showSearch = false"
      />
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

.icon {
  margin-right: 8px;
}

.main-content {
  width: 100%;
  padding: 20px;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 右上のコントロールエリアを作成 */
.top-controls {
  position: fixed;
  top: 20px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.theme-toggle {
  background-color: #fff;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.theme-toggle:hover {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.account {
  background-color: #fff;
  padding: 8px 16px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-weight: bold;
  white-space: nowrap;
}

.account p {
  margin: 0;
}

/* 検索窓 */
.search {
  position: fixed;
}

.search-trigger {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 10px 250px 10px 24px;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  color: #2c3e50;
}

.search-trigger:hover {
  background: #e5e7eb;
}


/* ダークモード */
:root.dark .theme-toggle {
  background-color: #2d3748;
  border-color: #4a5568;
}

:root.dark .theme-toggle:hover {
  background-color: #374151;
  border-color: #6b7280;
}

:root.dark .account {
  background-color: #2d3748;
  border-color: #4a5568;
  color: #cbd5e0;
}

.theme-toggle svg {
  width: 20px;
  height: 20px;
  color: #4a5568;
  transition: color 0.3s ease;
}

:root.dark .theme-toggle svg {
  color: #fbbf24;
}

:root.dark .search-trigger {
  background: #2d3748;
  border-color: #4a5568;
  color: #cbd5e0;
}
</style>