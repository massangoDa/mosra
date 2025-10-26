<script setup lang="ts">
interface SidebarLink {
  name: string;
  icon: string;
  to: string;
}

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  sidebar: {
    type: Array as PropType<SidebarLink[]>,
    default: () => []
  }
})
</script>

<template>
  <div>
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1 class="page-title">{{ title }}</h1>
          <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
          <slot name="header-left" />
        </div>
        <div v-if="$slots['header-right']" class="header-right">
          <slot name="header-right" />
        </div>
      </div>
      <div class="page-container">
        <nav v-if="sidebar && sidebar.length" class="sidebar">
          <NuxtLink
              v-for="link in sidebar"
              :key="link.to"
              :to="link.to"
              class="sidebar-link"
          >
            <v-icon :name="link.icon" class="sidebar-link-icon"/>
            {{ link.name }}
          </NuxtLink>
        </nav>
        <div class="content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: row;
  gap: 24px;
  height: calc(100vh - 120px);
}
.sidebar {
  flex-shrink: 0;
  width: 220px;
  justify-content: start;
}
.content {
  flex: 1;
  padding: 24px;
  border-radius: 16px;
  overflow-y: auto;
}
.sidebar-link {
  color: var(--color-text-secondary) !important;
}
</style>