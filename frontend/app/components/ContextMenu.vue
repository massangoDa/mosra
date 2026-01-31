<template>
  <div
      v-if="menuVisible"
      :style="{ top: menuTop + 'px', left: menuLeft + 'px' }"
      class="context-menu"
  >
    <ul>
      <li v-for="item in items" :key="item.id" @click="handleItemClick(item)">
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface MenuItem {
  id: string;
  label: string;
}

const menuVisible = ref(false);
const menuTop = ref(0);
const menuLeft = ref(0);
const selectedId = ref<string | null>(null);

const props = defineProps<{
  items: MenuItem[];
}>();

const emit = defineEmits<{
  itemClick: [id: string, itemId: string];
}>();

function openMenu(e: MouseEvent, id: string) {
  e.preventDefault();
  menuVisible.value = true;
  menuTop.value = e.clientY;
  menuLeft.value = e.clientX;
  selectedId.value = id;
}

function closeMenu() {
  menuVisible.value = false;
}

function handleItemClick(item: MenuItem) {
  emit('itemClick', selectedId.value!, item.id);
  closeMenu();
}

onMounted(() => {
  document.addEventListener('click', closeMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenu);
});

defineExpose({ openMenu });
</script>

<style scoped>
.context-menu {
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu li {
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.context-menu li:hover {
  background-color: #f0f0f0;
}

.context-menu li:last-child {
  border-bottom: none;
}
</style>