<script setup lang="ts">
import {useAsyncData, useRuntimeConfig, useRoute} from "#imports";
import {marked} from "marked";

interface RepairedPC {
  title: string
  documentId: string
  companies: Array<{name: string}>
  pcIMage: string
  working_history: string
  model?: string
  CPU?: string
  Memory?: string
  OS?: string
  HDD?: string
  Wifi?: string
  detail?: string
  GPU?: string
}

const route = useRoute()
const id = route.params.id as string

const config = useRuntimeConfig()
const API_KEY = config.public.bazaarApiKey
const URL = config.public.serverUrl

// Markdownの設定
marked.setOptions({
  breaks: true,
  gfm: true,
})

// 単一のアイテムを取得
const { data: repairedPC, error } = await useAsyncData<RepairedPC>(
    `repair-${id}`,
    async () => {
      try {
        const res: any = await $fetch(`${URL}/api/repaired-pcs/${id}?populate=companies&populate=pcIMage`, {
          headers: { Authorization: `Bearer ${API_KEY}` }
        })

        // 単一取得時はres.dataが直接オブジェクト
        const item = res.data
        return {
          title: item.title,
          documentId: item.documentId,
          companies: item.companies || [],
          pcIMage: item.pcIMage && item.pcIMage.length > 0 ? item.pcIMage[0].url : '',
          working_history: item.working_history,
          model: item.model,
          CPU: item.CPU,
          Memory: item.Memory,
          OS: item.OS,
          HDD: item.HDD,
          Wifi: item.Wifi_Card,
          detail: item.detail,
          GPU: item.GPU,
        }
      } catch (e) {
        console.error(e)
        throw createError({
          statusCode: 404,
          statusMessage: 'PC情報が見つかりません'
        })
      }
    }
)

// Markdown拡張機能
const extractDomain = (url: string): string => {
  try {
    const match = url.match(/^https?:\/\/([^\/]+)/);
    return match ? match[1] : url;
  } catch {
    return url;
  }
};
const linkCardTokenizer = {
  name: 'linkcard',
  level: 'inline',
  start(src: string) {
    const match = src.match(/%%\s*https?:\/\/[^\s@]+\s*%%/);
    if (!match) return;
    const beforeMatch = src.substring(0, match.index);
    const backtickCount = (beforeMatch.match(/`/g) || []).length;
    if (backtickCount % 2 !== 0) return;
    const codeBlockMatches = beforeMatch.match(/```/g);
    const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0;
    if (codeBlockCount % 2 !== 0) return;
    return match.index;
  },
  tokenizer(src: string) {
    const rule = /^%%\s*(https?:\/\/[^\s@]+)\s*%%/;
    const match = rule.exec(src);
    if (match) {
      const [raw, url] = match;
      if (raw.includes('```') || (raw.match(/`/g)?.length || 0) % 2 !== 0) {
        return;
      }
      return {
        type: 'linkcard',
        raw,
        url: url.trim(),
      };
    }
  },
  renderer(token: any) {
    const domain = extractDomain(token.url);
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    return `
      <div class="link-card">
        <a href="${token.url}" target="_blank" rel="noopener noreferrer" class="link-card-content">
          <div class="link-card-info">
            <div class="link-card-title">${token.url}</div>
            <div class="link-card-domain">
              <img src="${favicon}" alt="" class="link-card-favicon" />
              ${domain}
            </div>
          </div>
          <div class="link-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </div>
        </a>
      </div>
    `;
  }
}

// Markdown拡張機能の適用
marked.use( { extensions: [linkCardTokenizer]} )

// Markdownに変換
const markdownToHtml = (markdown?: string) => {
  if (!markdown) return ''
  return marked(markdown)
}
</script>

<template>
  <div class="repair-detail">
    <div v-if="repairedPC" class="pc-detail">
      <h1 class="pc-title">{{ repairedPC.title }}</h1>

      <div class="pc-info">
        <div class="inf-box">
          <p><strong>作業日</strong></p>
          <p>{{ repairedPC.working_history }}</p>
        </div>

        <div v-if="repairedPC.model" class="inf-box">
          <p><strong>型番</strong></p>
          <p>{{ repairedPC.model }}</p>
        </div>

        <div v-if="repairedPC.CPU" class="inf-box">
          <p><strong>CPU</strong></p>
          <p>{{ repairedPC.CPU }}</p>
        </div>

        <div v-if="repairedPC.Memory" class="inf-box">
          <p><strong>メモリ</strong></p>
          <p>{{ repairedPC.Memory }}</p>
        </div>

        <div v-if="repairedPC.OS" class="inf-box">
          <p><strong>OS</strong></p>
          <p>{{ repairedPC.OS }}</p>
        </div>

        <div v-if="repairedPC.HDD" class="inf-box">
          <p><strong>ストレージ</strong></p>
          <p>{{ repairedPC.HDD }}</p>
        </div>

        <div v-if="repairedPC.GPU" class="inf-box">
          <p><strong>GPU</strong></p>
          <p>{{ repairedPC.GPU }}</p>
        </div>

        <div v-if="repairedPC.Wifi" class="inf-box">
          <p><strong>無線LAN</strong></p>
          <p>{{ repairedPC.Wifi }}</p>
        </div>

        <div v-if="repairedPC.companies && repairedPC.companies.length > 0" class="inf-box">
          <p><strong>メーカー</strong></p>
          <p>
      <span v-for="(company, index) in repairedPC.companies" :key="company.name">
        {{ company.name }}<span v-if="index < repairedPC.companies.length - 1">, </span>
      </span>
          </p>
        </div>
      </div>
      <div class="pc-image-section">
        <h2>実際の画像</h2>
        <div v-if="repairedPC.pcIMage" class="pc-image-container">
          <img
              :src="`${URL}${repairedPC.pcIMage}`"
              :alt="repairedPC.title"
              class="pc-image"
          >
        </div>
      </div>

      <div class="content">
        <h2>サポートなど</h2>
        <div class="markdown-content" v-html="markdownToHtml(repairedPC.detail)"></div>
      </div>

      <div class="back-link">
        <router-link to="/repairs" class="back-button">一覧に戻る</router-link>
      </div>
    </div>

    <div v-else class="loading">
      読み込み中...
    </div>
  </div>
</template>

<style scoped>
.repair-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.pc-detail {
  background: #fff;
}

.pc-title {
  margin: 0 0 40px 0;
  padding: 0;
  font-size: 2rem;
  font-weight: 300;
  color: #333;
  text-align: center;
  letter-spacing: -0.5px;
}

.pc-info {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: 60px;
}

.inf-box {
  background: #fff;
  border: 1px solid #f1f1f1;
  border-radius: 8px;
  padding: 24px;
  text-align: left;
}

.inf-box p:first-child {
  margin: 0 0 8px 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: #1976d2;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.inf-box p:last-child {
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
  color: #333;
}

.pc-image-section h2 {
  margin: 0 0 24px 0;
  font-weight: 300;
  color: #333;
  text-align: center;
}

.pc-image-container {
  text-align: center;
  margin-bottom: 40px;
}

.pc-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 4px;
}

.back-link {
  text-align: center;
}

.back-button {
  display: inline-block;
  padding: 10px 24px;
  background: #1976d2;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 400;
  font-size: 0.9rem;
  transition: opacity 0.2s ease;
}

.back-button:hover {
  opacity: 0.8;
  color: #fff;
  text-decoration: none;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  font-size: 1rem;
  color: #999;
}

.pc-detail {
  animation: fadeInUp 0.3s ease-out;
}

.content {
  margin-bottom: 60px;
}

.content h2 {
  text-align: center;
  font-weight: 300;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .repair-detail {
    padding: 20px 15px;
  }

  .pc-title {
    font-size: 1.6rem;
    margin-bottom: 30px;
  }

  .pc-info {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 40px;
  }

  .inf-box {
    padding: 20px;
  }
}
</style>