<script setup lang="ts">
import { ref } from 'vue';
import type {SearchResult} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";

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
</script>

<template>
  <div>
    <div class="search">
      <div class="search-wrap">
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
            <div class="item-description">{{ result.amount }}</div>
          </div>
        </div>
        <div class="search-empty" v-else>
          結果がありません
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 80px 20px 20px;
}

.search-wrap {
  background-color: #fff;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: calc(100vh - 160px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.search-input input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
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

.test-buttons {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  background-color: #f9fafb;
}

.test-buttons button {
  padding: 8px 16px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.test-buttons button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.test-buttons button:active {
  transform: scale(0.98);
}
</style>