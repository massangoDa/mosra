<script setup lang="ts">
import {ref} from "vue";
import {useAsyncData, useRuntimeConfig} from "#imports";

interface RepairedPC {
  title: string
  documentId: string
  companies: Array<{name: string}>
  pcIMage: string
  working_history: string
}

interface GroupedPCs {
  [companyName: string]: RepairedPC[]
}

const repairedPCs = ref<RepairedPC[]>([])

const config = useRuntimeConfig()
const API_KEY = config.public.bazaarApiKey
const URL = config.public.serverUrl

const { data, error } = await useAsyncData<RepairedPC[]>(
    'repaired-pcs',
    async () => {
      try {
        const res: any = await $fetch(`${URL}/api/repaired-pcs?populate=companies&populate=pcIMage`, {
          headers: { Authorization: `Bearer ${API_KEY}` }
        })
        return res.data.map((item: any) => ({
          title: item.title,
          documentId: item.documentId,
          companies: item.companies|| [],
          pcIMage: item.pcIMage && item.pcIMage.length > 0 ? item.pcIMage[0].url : '',
          working_history: item.working_history,
        }))
      } catch (e) {
        console.error(e)
        return []
      }
    }
)

repairedPCs.value = data.value || []

const groupedPCs = computed<GroupedPCs>(() => {
  const grouped: GroupedPCs = {}

  repairedPCs.value.forEach(pc => {
    if (pc.companies && pc.companies.length > 0) {
      pc.companies.forEach(company => {
        if (!grouped[company.name]) {
          grouped[company.name] = []
        }
        grouped[company.name].push(pc)
      })
    } else {
      if (!grouped['未分類']) {
        grouped['未分類'] = []
      }
      grouped['未分類'].push(pc)
    }
  })

  return grouped
})

const companyNames = computed(() => {
  return Object.keys(groupedPCs.value).sort()
})
</script>

<template>
  <div>
    <div class="pc-groups">
      <div v-for="companyName in companyNames" :key="companyName" class="company-group">
        <h2 class="company-title">{{ companyName }}</h2>

        <ul class="pc-list">
          <li v-for="item in groupedPCs[companyName]" :key="item.documentId" class="pc-item">
            <router-link :to="`/repair/${item.documentId}`" class="pc-link">
              {{ item.working_history }} 【{{ item.title }}】
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-groups {
  margin: 0;
  padding: 0;
}

.company-group {
  margin-bottom: 40px;
}

.company-title {
  font-size: 1.3rem;
  color: #333;
  border-bottom: 3px solid #007aff;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-weight: bold;
}

.pc-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.pc-item {
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.pc-item:last-child {
  border-bottom: none;
}

.pc-link {
  text-decoration: none;
  color: #007aff;
  font-size: 1.1rem;
}

.pc-link:hover {
  text-decoration: underline;
}
</style>
