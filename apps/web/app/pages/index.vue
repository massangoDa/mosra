<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/crm/dashboard', { replace: true })
    },
  ],
})
</script>

<template>
  <div></div>
</template>