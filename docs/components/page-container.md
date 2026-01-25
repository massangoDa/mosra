# PageContainer

`PageContainer` はページの基本レイアウトを提供します。

## Props
`title` プロパティは、静的な文字列なら `title="固定題名"`、変数を渡す場合は `:title="dynamicTitle"` として使用します。
`title` を複数の変数から代入したい場合は `:title="`${変数名1} - ${変数名2}`" として使用します。

**例:**
`:title="`${customer?.companyName} - ${caseData?.caseName}`"`

## Usage

```vue
<script setup lang="ts">
const sidebarLink = [
  { name: 'ダッシュボード', icon: 'md-dashboard', to: '/dashboard' },
  { name: '顧客一覧', icon: 'md-people', to: '/customers' }
];

const showModal = ref(false);
</script>

<template>
  <PageContainer title="顧客管理" subtitle="顧客の詳細情報を表示しています" :sidebar="sidebarLink">
    <template #header-left>
      <span class="badge">Active</span>
    </template>
    
    <template #header-right>
      <button @click="showModal = true" class="NewInfoButton">
        + 新規追加
      </button>
    </template>
    
    <div class="section">
      <div class="content">
        
      </div>
    </div>
  </PageContainer>
</template>
```