# PageContainer

`PageContainer` はページの基本レイアウトを提供します。
`title` プロパティは、静的な文字列なら `title="固定題名"`、変数を渡す場合は `:title="dynamicTitle"` として使用します。

## Usage

```vue
<script setup lang="ts">
const sidebarLinks = [
  { name: 'ダッシュボード', icon: 'md-dashboard', to: '/dashboard' },
  { name: '顧客一覧', icon: 'md-people', to: '/customers' }
];

const showModal = ref(false);
</script>

<template>
  <PageContainer title="顧客管理" subtitle="顧客の詳細情報を表示しています" :sidebar="sidebarLinks">
    <!-- ヘッダー左側: タイトルの横に追加要素が必要な場合 -->
    <template #header-left>
      <span class="badge">Active</span>
    </template>

    <!-- ヘッダー右側: アクションボタンなど -->
    <template #header-right>
      <button @click="showModal = true" class="NewInfoButton">
        + 新規追加
      </button>
    </template>

    <!-- メインコンテンツ -->
    <section class="content-section">
      <h2>セクションタイトル</h2>
      <div class="card">
        <p>ここにメインのコンテンツを配置します。</p>
      </div>
    </section>
  </PageContainer>
</template>
```