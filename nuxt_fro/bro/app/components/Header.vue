<template>
  <header class="header">
    <div class="logo">
      <NuxtLink to="/" custom v-slot="{ navigate }">
        <span class="site-title" @click="navigate">MOSRA</span>
      </NuxtLink>
    </div>
    <nav class="nav">
      <NuxtLink
          to="/"
          custom
          v-slot="{ href, navigate, isActive }"
      >
        <a
            :href="href"
            @click="navigate"
            :class="['nav-link', { active: isActive }]"
        >
          <v-icon name="hi-home" />
          Home
        </a>
      </NuxtLink>
      <NuxtLink
          to="/blogs"
          custom
          v-slot="{ href, navigate, isActive }"
      >
        <a
            :href="href"
            @click="navigate"
            :class="['nav-link', { active: isActive }]"
        >
          <v-icon name="hi-pencil-alt" />
          Blog
        </a>
      </NuxtLink>
      <NuxtLink
          to="/about"
          custom
          v-slot="{ href, navigate, isActive }"
      >
        <a
            :href="href"
            @click="navigate"
            :class="['nav-link', { active: isActive }]"
        >
          <v-icon name="bi-info-circle" />
          About
        </a>
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
// ロジックが必要な場合はここに記述
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 60px;
  transition: all 0.3s ease;
}

/* スクロール時のより透明な背景（オプション） */
.header:hover {
  background: rgba(255, 255, 255, 0.95);
}

.logo {
  position: absolute;
  left: 2rem;
}

.site-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: color 0.2s ease;
}

.site-title:hover {
  color: #007AFF;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  padding: 0.3rem 0.75rem;
  backdrop-filter: blur(20px);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.nav-link:hover {
  color: #333;
  background: rgba(0, 122, 255, 0.1);
}

.nav-link.active {
  color: #007AFF;
}

.nav-link svg {
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .header {
    padding: 0.75rem 1rem;
  }

  .nav {
    gap: 0.125rem;
    padding: 0.375rem 0.5rem;
  }

  .nav-link {
    padding: 0.375rem 0.75rem;
    font-size: 13px;
  }

  .nav-link span {
    display: none;
  }

  .site-title {
    font-size: 1.25rem;
  }

  .logo {
    display: none;
  }
}
</style>
