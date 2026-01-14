<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import '~/assets/css/parallel.css'
import { useRuntimeConfig } from '#imports'
import { marked } from 'marked'

definePageMeta({
  layout: 'parallel',
})

useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, user-scalable=no'
    }
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/fullPage.js/2.9.6/jquery.fullpage.min.css'
    }
  ],
  script: [
    {
      src: 'https://code.jquery.com/jquery-3.6.0.min.js',
      defer: true
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/fullPage.js/2.9.6/jquery.fullpage.min.js',
      defer: true
    }
  ]
})

interface ParallelWorld {
  text: string
}

const config = useRuntimeConfig()
const API_KEY = config.public.bazaarApiKey
const URL = config.public.serverUrl

marked.setOptions({
  breaks: true,
  gfm: true,
})

const sections = ref<string[]>([])
const currentPage = ref(1)
const totalPages = computed(() => sections.value.length + 1)

// JSONからMarkdown取得
const { data: repairedPC } = await useAsyncData<ParallelWorld>(
    'parallelworld-id',
    async () => {
      try {
        const res: any = await $fetch(`${URL}/api/parallel-worlds/dxc4jipqq13n138ykucpm5ii`, {
          headers: { Authorization: `Bearer ${API_KEY}` }
        })
        return { text: res.data.text }
      } catch (e) {
        console.error(e)
        throw createError({ statusCode: 404, statusMessage: 'ない' })
      }
    }
)

// Markdown をセクションごとに分割
if (repairedPC.value?.text) {
  const lines = repairedPC.value.text.split('\n')
  let buffer = ''
  lines.forEach(line => {
    if (line.startsWith('## ')) {
      if (buffer) sections.value.push(buffer)
      buffer = line + '\n'
    } else {
      buffer += line + '\n'
    }
  })
  if (buffer) sections.value.push(buffer)
}

// Markdown → HTML
const markdownToHtml = (md: string) => marked(md)

onMounted(() => {
  if (process.client) {
    // v2 は jQuery プラグイン方式
    // @ts-ignore
    ($('#fullpage') as any).fullpage({
      autoScrolling: true,
      navigation: true,
      // モバイル対応の設定
      scrollingSpeed: 700,
      touchSensitivity: 5,
      normalScrollElementTouchThreshold: 5,
      // ページ変更時のコールバック
      afterLoad: function(anchorLink: string, index: number) {
        currentPage.value = index
      },
      onLeave: function(index: number, nextIndex: number, direction: string) {
        currentPage.value = nextIndex
      }
    })
  }
})
</script>

<template>
  <NuxtLayout>
    <div id="fullpage">
      <!-- 最初のイントロセクション -->
      <div class="section intro-section">
        <div class="parallel-world">
          <h1>俺の思う平行世界へようこそ</h1>
          <p>下にスワイプしてください</p>
        </div>
      </div>

      <!-- Markdown由来の動的セクション -->
      <div v-for="(section, index) in sections" :key="index" class="section book">
        <div class="content-wrapper" v-html="markdownToHtml(section)"></div>
      </div>
    </div>

    <!-- ページカウンター -->
    <div class="page-counter">
      {{ currentPage }} / {{ totalPages }}
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* 最初のセクション用スタイル */
.intro-section {
  background-color: #000;
  background-image: url('/IMG_1134.JPG');
  background-size: cover;
  background-position: center;
}

.parallel-world {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
}

.parallel-world h1 {
  color: #0a1a3f;
  font-size: 4.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.parallel-world p {
  color: #0a1a3f;
  font-size: 1.8rem;
  text-align: center;
}

/* コンテンツセクション用スタイル */
.content-wrapper {
  max-width: 100%;
  max-height: 800px;
  margin: 0 auto;
  padding: 2rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  writing-mode: vertical-rl;
  overflow-y: auto;

  background-image:
      linear-gradient(to right, #d1d5db 1px, transparent 1px),
      linear-gradient(to bottom, #d1d5db 1px, transparent 1px);
  background-size: 30px 100%, 100% 30px;
}

.book {
  background-color: #f4f0e6;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transform-style: preserve-3d;
  transition: transform 0.8s ease-in-out;
}

/* ページカウンター */
.page-counter {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.content-wrapper h2) {
  font-size: 3rem;
}

:deep(.content-wrapper h3) {
  font-size: 2.5rem;
}

:deep(.content-wrapper p) {
  font-size: 1.3rem;
  line-height: 2;
}

:deep(.content-wrapper img) {
  max-width: 100%;
  height: auto;
}

:deep(ul li) {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

:deep(strong) {
  background: linear-gradient(120deg, #fff3a0 0%, #ffe066 100%);
  padding: 0.1em 0.3em;
  border-radius: 2px;
  font-weight: 600;
  color: #1a1510;
}

:deep(#fullpage) {
  font-family: 'Noto Serif JP', '游明朝', 'YuMincho', 'Hiragino Mincho ProN', serif;
}

@media (max-width: 768px) {
  .parallel-world h1 {
    font-size: 3rem;
  }

  .parallel-world p {
    font-size: 1.4rem;
  }

  .content-wrapper {
    padding: 1.5rem;
    max-height: 100vh;
  }

  :deep(.content-wrapper h2) {
    font-size: 2.5rem;
  }

  :deep(.content-wrapper h3) {
    font-size: 2rem;
  }

  :deep(.content-wrapper p) {
    font-size: 1.2rem;
    line-height: 1.8;
  }

  :deep(ul li) {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .parallel-world h1 {
    font-size: 2.2rem;
    line-height: 1.2;
  }

  .parallel-world p {
    font-size: 1.2rem;
  }

  .content-wrapper {
    padding: 1rem;
    writing-mode: horizontal-tb;
    text-align: left;
    background-image:
        linear-gradient(to bottom, #d1d5db 1px, transparent 1px);
    background-size: 100% 30px;
  }

  .page-counter {
    bottom: 15px;
    right: 15px;
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  :deep(.content-wrapper h2) {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  :deep(.content-wrapper h3) {
    font-size: 1.5rem;
    margin-bottom: 0.8rem;
  }

  :deep(.content-wrapper p) {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  :deep(ul li) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
}

@media (max-width: 360px) {
  .parallel-world h1 {
    font-size: 1.8rem;
  }

  .parallel-world p {
    font-size: 1rem;
  }

  .content-wrapper {
    padding: 0.8rem;
  }

  :deep(.content-wrapper h2) {
    font-size: 1.5rem;
  }

  :deep(.content-wrapper h3) {
    font-size: 1.3rem;
  }

  :deep(.content-wrapper p) {
    font-size: 0.9rem;
  }

  :deep(ul li) {
    font-size: 0.9rem;
  }
}
</style>