# useCustomerStore の使い方

顧客情報をアプリ全体で一貫して扱うためのストア。

## 主なメソッド
- loadCustomer(customerId) → 顧客データを取得して store にセット
- updateCustomer(payload) → store とバックエンドを更新
- clearCustomer() → ストアを初期化

## 使い方例
```ts
const customerStore = useCustomerStore()
onMounted(async () => {
    await customerStore.loadCustomer(customerId)
})
```

- 同じ顧客 data を複数ページで二重取得しないよう、ページ間で store を先に確認する。
- store の状態が UI に反映されることを前提に、ページ側では `customerStore.customer` を参照して表示を組み立てる。
- エラーや loading フラグは store 側で持たせても、ページ側で持たせても良い。統一を検討してください。

## 型の扱い
- store の customer は `ref<Customer | null>` のようにしておき、ページ側で `customerStore.customer?.companyName` のように安全に参照する。