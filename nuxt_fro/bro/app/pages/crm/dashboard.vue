<script setup lang="ts">
definePageMeta({
  layout: 'crm-layout',
})

const { userInfo, loading, fetchUserInfo, authToken } = useAuth()

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
  <div>
    <div class="container">
      <p>Welcome back, {{ userInfo?.name }}!</p>
      <h1>Dashboard</h1>

    </div>
  </div>
</template>

<style scoped>

</style>