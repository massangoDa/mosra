<script setup lang="ts">
import { ref } from 'vue'
import { useRuntimeConfig, useAsyncData } from '#imports'
import { useHead } from '#app';

useHead({
  title: 'MOSRA - ブログ一覧',
  meta: [
    { name: 'description', content: '日常の気づきや考察、趣味のこと、時には数学も。私が感じたことを自由にまとめて発信するブログです。' },
    { property: 'og:title', content: 'MOSRA – ブログ一覧' },
    { property: 'og:description', content: '日常の気づきや考察、趣味のこと、時には数学も。私が感じたことを自由にまとめて発信するブログです。' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og2.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'MOSRA – ブログ一覧' },
    { name: 'twitter:description', content: '日常の気づきや考察、趣味のこと、時には数学も。私が感じたことを自由にまとめて発信するブログです。' },
    { name: 'twitter:image', content: '/og2.png' },
  ],
});

interface Blog {
  title: string
  paper: string
  date: string
  publishedAt: string
  documentId: string
  thumbnail: string
  tags: string[]
}

const blogs = ref<Blog[]>([])
const route = useRoute()

const config = useRuntimeConfig()
const API_KEY = config.public.bazaarApiKey
const URL = config.public.serverUrl

const { data, error, refresh } = await useAsyncData<Blog[]>(
    `blogs-${route.path}`, // ルートパスをキーに含める
    async () => {
      try {
        const res: any = await $fetch(`${URL}/api/articles?populate=tags&populate=thumbnail`, {
          headers: { Authorization: `Bearer ${API_KEY}` },
          // キャッシュを無効化
          server: false
        })
        return res.data.map((item: any) => ({
          title: item.title,
          paper: item.paper,
          date: item.date,
          publishedAt: item.publishedAt,
          documentId: item.documentId,
          thumbnail: item.thumbnail?.url || '',
          tags: item.tags?.map((tag: any) => tag.name) || [],
        })).sort((a: Blog, b: Blog) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      } catch (e) {
        console.error(e)
        return []
      }
    },
    {
      // クライアントサイドでのみ実行
      server: false,
      // デフォルト値を設定
      default: () => []
    }
)

// データを監視して blogs に代入
watch(data, (newData) => {
  if (newData) {
    blogs.value = newData
  }
}, { immediate: true })

// ページマウント時に強制的に再フェッチ
onMounted(() => {
  refresh()
})

// ルート変更を監視して再フェッチ
watch(() => route.path, (newPath) => {
  if (newPath === '/blogs') {
    nextTick(() => {
      refresh()
    })
  }
})
</script>

<template>
  <div class="container">
    <h1>ブログ一覧</h1>
    <div class="blog-list">
      <div class="blog-card">
        <div
            v-for="item in blogs"
            :key="item.documentId"
            class="blog-item"
        >
          <router-link :to="`/blog/${item.documentId}`" class="blog-link">
            <img :src="`${URL}${item.thumbnail}`" alt="画像">
            <h2>{{ item.title }}</h2>
            <p>
              <span v-for="tag in item.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </p>
            <p><v-icon name="bi-calendar-event" class="date"/>{{ item.date }}</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  font-size: 2.25rem;
  font-weight: bold;
  line-height: 1.3;
  margin-bottom: 2rem;
}

.blog-list {
  width: 100%;
}

.blog-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 100%;
}

@media (min-width: 1024px) {
  .blog-card {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1023px) and (min-width: 768px) {
  .blog-card {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .blog-card {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.blog-item {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.blog-item:hover {
  transform: translateY(-4px);
  border-color: #cbd5e1;
}

.blog-link {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.blog-link img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.blog-link h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 1rem 0.5rem 1rem;
  line-height: 1.4;
  color: #1a202c;
}

.blog-link p {
  margin: 0 1rem;
  line-height: 1.6;
  color: #4a5568;
}

.blog-link p:first-of-type {
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.blog-link p:last-of-type {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

a, .green {
  padding: 0;
}

.date {
  margin-right: 0.2rem;
}
</style>