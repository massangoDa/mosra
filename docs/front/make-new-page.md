# 新しいCRMページを作る

`make-new-page`は、`pages/crm`に新しいページを追加する際のテンプレートとよくあるパターン(storeやdata loader の使い方)をまとめたものです。

## **重要**
- ファイル名がそのまま URL になります(例: `pages/crm/customer/[id].vue` → `/crm/customer/123`)。
- ページは`crm-layout`を使うことを想定しています。必要に応じて`definePageMeta`を変更してください。

## テンプレート
```vue
<script setup lang="ts">
import '~/assets/css/pages/id.css'

definePageMeta({
  layout: 'crm-layout'
})
</script>

<template>
 <div>
   
 </div>
</template>

<style scoped>

</style>
```

## よく使うパターン（store と data loader と PageContainer の組み合わせ）
```vue
<script setup lang="ts">
import '~/assets/css/pages/id.css'
import {useCustomerStore} from "~/store/customer";
import {NEW_API_ENDPOINTS} from "~/api/nendpoints";
import type {Case} from "~/types/types";

definePageMeta({ layout: 'crm-layout' })

const customerStore = useCustomerStore()
const caseData = ref<Case | null>(null)
const { customerId, caseId } = useRoute().params

const sidebarLink = [
  { name: '案件に戻る', icon: 'md-keyboardreturn', to: `/crm/customer/${customerId}/new/case/${caseId}` },
  // ...
]

onMounted(async () => {
  await customerStore.loadCustomer(customerId) // customerStore の使い方参照
  await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.detail(customerId, caseId), caseData)
})
</script>

<template>
  <PageContainer :title="`${customerStore.customer?.companyName} - ${caseData?.caseName}`" :sidebar="sidebarLink">
    age-contai    <div class="section">
      <div class="content">
        <!-- コンテンツ -->
      </div>
    </div>
  </PageContainer>
</template>
```

## 注意点
- store の読み込み（例: `customerStore.loadCustomer`）は await してデータが揃ってから表示してください。
- `useDataLoader().loadData(endpoint, refVar)` は指定した `ref` に結果を入れるため、型を合わせておくと TypeScript 上で扱いやすいです（`ref<Case | null>(null)` 等）。
- ルートパラメータは `useRoute().params` から取得します。

## 関連ドキュメント
- [customer-store.md（store の使い方）](./customer-store.md)
- [data-loader.md（loadData の詳細）](../composable/data-loader.md)
- [page-container.md（PageContainer の使い方）](../components/page-container.md)