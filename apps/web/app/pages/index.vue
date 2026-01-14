<script setup lang="ts">
import { useHead } from '#app';
import {ref} from "vue";
import {useAsyncData, useRuntimeConfig} from "#imports";
import Repairs from "~/pages/repairs.vue";

useHead({
  title: 'MOSRA - ホーム',
  meta: [
    { name: 'description', content: '日常の気づきや考察、趣味のこと、時には数学も。私が感じたことを自由にまとめて発信するブログです。また、自分の欲しいと思ったツールなども公開しています。' },
    { property: 'og:title', content: 'MOSRA - ホーム' },
    { property: 'og:description', content: '日常の気づきや考察、趣味のこと、時には数学も。私が感じたことを自由にまとめて発信するブログです。また、自分の欲しいと思ったツールなども公開しています。' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'MOSRA - ホーム' },
    { name: 'twitter:description', content: '日常の気づきや考察、趣味のこと、時には数学も。私が感じたことを自由にまとめて発信するブログです。また、自分の欲しいと思ったツールなども公開しています。' },
    { name: 'twitter:image', content: '/og.png' },
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

const config = useRuntimeConfig()
const API_KEY = config.public.bazaarApiKey
const URL = config.public.serverUrl

const { data, error } = await useAsyncData<Blog[]>(
    'blogs',
    async () => {
      try {
        const res: any = await $fetch(`${URL}/api/articles?populate=tags&populate=thumbnail`, {
          headers: { Authorization: `Bearer ${API_KEY}` }
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
    }
)

blogs.value = data.value || []

const latestBlogs = computed(() => {
  return blogs.value.slice(0, 3)
})

</script>

<template>
  <div class="container">
    <div class="intro">
      <img src="/me.png" alt="me" class="me">
      <div class="git-int">
        <div class="header">
          <p class="file-path">massango/README.<span>md</span></p>
          <button class="edit-btn">
            <v-icon name="fa-pencil-alt" animation="float" />
          </button>
        </div>
        <!--  Githubネタ   -->
        <div class="content">
          <h2>Hi there 👋</h2>

          <div class="profile-section">
            <h3>技術スタック</h3>
            <div class="tech-stack">
              <div class="badges">
                <span class="badge vue">Vue.js</span>
                <span class="badge ts">TypeScript</span>
                <span class="badge js">JavaScript</span>
                <span class="badge html">HTML</span>
                <span class="badge css">CSS</span>
                <span class="badge node">Node.js</span>
              </div>
            </div>
          </div>

          <h3>私とつながる</h3>
          <div class="social-links">
            <a href="https://github.com/massangoDa" class="social-link github">
              <v-icon name="fa-github" animation="wrench" />
              GitHub
            </a>
            <a href="https://open.spotify.com/user/31eqtjsukb2zvxjg7lpz2hk5z4ve" class="social-link spotify">
              <v-icon name="fa-spotify" animation="wrench" />
              Spotify
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="content1">
      <h3>おすすめのブログ記事</h3>
      <div class="blog-list">
        <div class="blog-card">
          <div
              v-for="item in latestBlogs"
              :key="item.documentId"
              class="blog-item"
          >
            <router-link :to="`/blog/${item.documentId}`" class="blog-link">
              <img :src="`${URL}${item.thumbnail}`" alt="">
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

    <div class="content1">
      <h3>今までに直した・扱ったPC</h3>
      <repairs />
    </div>

<!--    <div class="content1">-->
<!--      <div class="nice-service">-->
<!--        <div class="service-header">-->
<!--          <h3>おすすめツール</h3>-->
<!--          <p class="service-description">私が開発したツールをご紹介します</p>-->
<!--        </div>-->

<!--        <div class="service">-->
<!--          <NuxtLink to="/" class="service-item">-->
<!--            <div class="service-image">-->
<!--              <NuxtImg src="/asshuku.png" alt="動画圧縮サービス" />-->
<!--              <div class="service-overlay">-->
<!--                <span class="status-badge active">稼働中</span>-->
<!--              </div>-->
<!--            </div>-->

<!--            <div class="service-content">-->
<!--              <h4 class="service-title">動画圧縮サービス</h4>-->
<!--              <p class="service-desc">動画ファイルを圧縮して、品質を保ちながらファイルサイズを削減します。</p>-->

<!--              <div class="service-tags">-->
<!--                <span class="badge ffmpeg">FFmpeg</span>-->
<!--                <span class="badge node">Node.js</span>-->
<!--                <span class="badge vue">Vue.js</span>-->
<!--              </div>-->
<!--            </div>-->
<!--          </NuxtLink>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
}

.me {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e1e4e8;
  flex-shrink: 0;
}

.intro {
  display: flex;
  gap: 40px;
  margin-top: 40px;
}

.git-int {
  flex: 1;
  margin-left: 100px;
  font-size: 20px;
  border: 1px solid #d2d8d8;
  width: 100%;
  border-radius: 0.375rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #d0d7de;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.file-path {
  font-size: 14px;
  font-weight: 600;
  color: #24292f;
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
}

.file-path span {
  color: #919897;
}

.edit-btn {
  background-color: transparent;
  border: none;
  padding: 6px;
  border-radius: 4px;
  color: #656d76;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  color: #24292f;
  background-color: #f3f4f6;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.vue { background-color: #4fc08d; }
.badge.ts { background-color: #3178c6; }
.badge.js { background-color: #f7df1e; color: #000; }
.badge.html { background-color: #e34f26; }
.badge.css { background-color: #1572b6; }
.badge.node { background-color: #339933; }
.badge.ffmpeg { background-color: #28a745; }

.content, .content1 {
  padding: 20px;
}

.content h2 {
  font-size: 2rem;
  margin: 0 0 20px 0;
  color: #24292f;
  font-weight: 600;
  border-bottom: 1px solid #d0d7de;
}

.profile-section {
  margin-bottom: 30px;
}

.content h3 {
  font-size: 1.5rem;
  margin: 0 0 16px 0;
  color: #24292f;
  font-weight: 600;
}

.content1 h3 {
  font-size: 1.5rem;
  margin: 0 0 16px 0;
  color: #24292f;
  font-weight: 600;
}

.content a {
  color: #0969da;
  text-decoration: none;
}

.content a:hover {
  text-decoration: underline;
}

.tech-stack {
  margin-bottom: 30px;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  text-decoration: none;
  color: #24292f;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.social-link:hover {
  background-color: #f6f8fa;
  border-color: #8c959f;
  text-decoration: none;
}

.social-link.github { color: #24292f; }
.social-link.spotify { color: #1db954; }

/* サービス部分 */
.nice-service {
  margin-top: 40px;
}

.service-header {
  margin-bottom: 32px;
}

.service-header h3 {
  font-size: 1.8rem;
  color: #24292f;
  margin-bottom: 8px;
  font-weight: 700;
}

.service-description {
  font-size: 1.1rem;
  color: #656d76;
  margin: 0;
}

.service {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.service-item {
  position: relative;
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.service-item:hover {
  transform: translateY(-4px);
  border-color: #0969da;
}

.service-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #f6f8fa 0%, #e1e4e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.service-item:hover .service-image img {
  transform: scale(1.05);
}

.service-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #28a745;
  color: white;
}
.status-badge.private {
  background: #6c757d;
  color: white;
}

.service-content {
  padding: 20px;
}

.service-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #24292f;
  margin: 0 0 12px 0;
}

.service-desc {
  color: #656d76;
  line-height: 1.6;
  margin: 0 0 16px 0;
  font-size: 0.9rem;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 768px) {
  .intro {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .me {
    width: 150px;
    height: 150px;
  }

  .git-int {
    margin-left: 0;
  }

  .social-links {
    flex-direction: column;
  }

  .service {
    grid-template-columns: 1fr;
  }

  .service-header h3 {
    font-size: 2rem;
  }
}




.content1 {
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