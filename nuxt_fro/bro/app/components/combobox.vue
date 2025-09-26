<!-- components/Combobox.vue -->
<script setup lang="ts">
interface Props {
  items: string[]
  modelValue: string
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '選択してください',
  disabled: false
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const comboboxRef = ref<HTMLElement | null>(null)

// 選択肢をクリックした時の処理
const selectItem = (item: string) => {
  emit('update:modelValue', item)
  isOpen.value = false
}

// comboboxの外をクリックした時に閉じる
const handleClickOutside = (event: Event) => {
  if (comboboxRef.value && !comboboxRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// ESCキーで閉じる
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="combobox" ref="comboboxRef">
    <button
        type="button"
        class="combobox-trigger"
        :class="{ 'disabled': disabled }"
        @click="!disabled && (isOpen = !isOpen)"
        :aria-expanded="isOpen"
        :disabled="disabled"
    >
      <span class="combobox-value" :class="{ 'placeholder': !modelValue }">
        {{ modelValue || placeholder }}
      </span>
      <svg class="combobox-icon" :class="{ 'rotated': isOpen }" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <transition name="dropdown">
      <div v-if="isOpen && !disabled" class="combobox-dropdown">
        <ul class="combobox-list">
          <li
              v-for="item in items"
              :key="item"
              class="combobox-option"
              :class="{ 'selected': item === modelValue }"
              @click="selectItem(item)"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.combobox {
  position: relative;
  width: 100%;
}

.combobox-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.combobox-trigger:hover:not(.disabled) {
  border-color: #9ca3af;
}

.combobox-trigger:focus:not(.disabled) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.combobox-trigger.disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.combobox-value {
  text-align: left;
  color: #374151;
}

.combobox-value.placeholder {
  color: #9ca3af;
}

.combobox-trigger.disabled .combobox-value {
  color: #9ca3af;
}

.combobox-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.combobox-icon.rotated {
  transform: rotate(180deg);
}

.combobox-trigger.disabled .combobox-icon {
  color: #d1d5db;
}

.combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 4px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.combobox-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.combobox-option {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.2s ease;
}

.combobox-option:hover {
  background-color: #f3f4f6;
}

.combobox-option.selected {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.combobox-option:first-child {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.combobox-option:last-child {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

/* Dropdown アニメーション */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
  transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.8);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1);
}
</style>