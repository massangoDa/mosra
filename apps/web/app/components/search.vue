<script setup lang="ts">
import { ref } from 'vue';
import type {SearchResult} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";
const route = useRoute()
// 第二サイドバーがあるかどうか
const hasInnerSidebar = ref(false)
provide('hasInnerSidebar', hasInnerSidebar)

const emit = defineEmits(['close']);

const searchQuery = ref('');
const searchResults = ref<SearchResult[]>([])
const searchInputRef = ref<HTMLInputElement>();

async function searchData(event: Event) {
  try {
    const query = (event.target as HTMLInputElement).value;
    searchQuery.value = query;

    if (!query) {
      searchResults.value = [];
      return;
    }

    const res = await $fetch<{success: boolean, transactions: SearchResult[]}>(
        `${API_ENDPOINTS.search.transactions(searchQuery.value)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${useAuth().authToken.value}`
          },
        }
    )

    if (res.success) {
      searchResults.value = res.transactions;
    }
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = [];
  }
}

watch(
    () => route.path,
    (path) => {
      // sidebar1をミニ化してsidebar2を大きくする
      hasInnerSidebar.value = path.startsWith('/crm/settings') || /^\/crm\/customer\/[^/]+\/new\//.test(path)
    },
    { immediate: true }
)
</script>

<template>
  <div>
    <div :class="['search', { 'search--sidebar': hasInnerSidebar }]">
      <div :class="{'search-wrap': true, 'search-open': searchQuery.length > 0}">
        <div class="search-input">
          <input
              type="text"
              placeholder="Search"
              @input="searchData"
          />
        </div>
        <div class="search-list" v-if="searchResults.length > 0">
          <div
              class="search-item"
              v-for="result in searchResults"
              :key="result._id"
          >
            <div class="item-title">{{ result.product }}</div>
            <div class="item-description">{{ useFormat().formatCurrency(result.amount) }}</div>
          </div>
        </div>
        <div class="search-empty" v-else-if="searchResults.length === 0 && searchQuery.length > 0">
          結果がありません
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search {
  position: fixed;
}

.search--sidebar {
  margin-left: 20px;
}

.search-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  gap: 12px;
  background: var(--color-background);
  border-radius: 12px;
  transition: all 0.2s;
  text-align: left;
  color: var(--color-text);
}

.search-open {
  padding: 14px;
}

.search-input {
  flex-shrink: 0;
}


.search-input input {
  width: 100%;
  font-size: 16px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s;
  background-color: var(--color-background);
  cursor: pointer;
}
.search-input input:focus {
  border-color: #3b82f6;
}

.search-list {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  max-height: 50vh;
}

.search-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-item:hover {
  background-color: #f9fafb;
}

.search-item:last-child {
  border-bottom: none;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.item-description {
  font-size: 13px;
  color: #6b7280;
}

.search-empty {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}
</style>