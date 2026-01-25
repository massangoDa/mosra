# useDataLoader().loadData の使い方

`useDataLoader()` は API からデータを取得して指定した `ref` に結果をセットするコンポーザブルです。

# 使い方例
```ts
const caseData = ref<Case | null>(null)
onMounted(async () => {
    await useDataLoader().loadData(NEW_API_ENDPOINTS.customers.cases.list(customerId), caseData)
})
```
