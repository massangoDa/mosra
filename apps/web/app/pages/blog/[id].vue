<script setup lang="ts">
import { ref, watch, watchEffect, onMounted, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useAsyncData, useRuntimeConfig, useSeoMeta } from "#app";
import { marked } from "marked";
import katex from "katex";
import { useDebounceFn } from "@vueuse/core";

// --- 型定義 ---
interface Blog {
  title: string;
  paper: string;
  date: string;
  publishedAt: string;
  documentId: string;
  thumbnail: string;
  tags: string[];
}

interface TocItem {
  text: string;
  slug: string;
  level: number;
}

// --- 状態 ---
const route = useRoute();
const blog = ref<Blog | null>(null);
const toc = ref<TocItem[]>([]);
const activeSection = ref<string>("");
const renderedContent = ref<string>("");

const config = useRuntimeConfig();
const API_KEY = config.public.bazaarApiKey;
const URL = config.public.serverUrl;

// --- ブログ取得 (SSR待機) ---
const id = route.params.id as string;

// useAsyncDataでSSRの段階でデータを確実に取得
const { data: blogData } = await useAsyncData<Blog>(`blog-${id}`, async () => {
  if (!id) return null;

  const res: any = await $fetch(`${URL}/api/articles/${id}?populate=tags&populate=thumbnail`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  const item = res.data;
  return {
    title: item.title,
    paper: item.paper,
    date: item.date,
    publishedAt: item.publishedAt,
    documentId: item.documentId,
    thumbnail: item.thumbnail?.url || "",
    tags: item.tags?.map((tag: any) => tag.name) || [],
  };
});

// データが取得できたらblogにセット
if (blogData.value) {
  blog.value = blogData.value;
}

// --- SEO/OGP設定（データ取得後に1回だけ） ---
const seoTitle = computed(() => {
  return blog.value ? `${blog.value.title} - MOSRA` : 'MOSRA - ブログ';
});

const seoDescription = computed(() => {
  return blog.value
      ? blog.value.paper.slice(0, 100).replace(/\s+/g, ' ').trim()
      : 'ブログの内容を読み込んでいます…';
});

const ogImage = computed(() => {
  if (blog.value?.thumbnail) {
    return `https://cms.massango.jp${blog.value.thumbnail}`;
  }
  return '/og2.png';
});

// useSeoMetaを使ってリアクティブに設定
useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'article', // ブログ記事なのでarticleに変更
  ogImage: ogImage,
  ogUrl: () => `https://massango.jp/blog/${route.params.id}`,
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: ogImage,
});

// アバター画像のURLを取得する関数
const getAvatarUrl = (name: string): string => {
  const avatars: { [key: string]: string } = {
    'massango': '/avatars/massango.png',
    '友達A': '/avatars/friend-a.png',
  };
  return avatars[name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=48&background=random&color=fff`;
};

// --- marked renderer とカスタムトークナイザー---
const renderer = new marked.Renderer();
renderer.heading = (heading) => {
  const text = heading.tokens.map((token) => ("raw" in token ? token.raw : "")).join("");
  const slug = encodeURIComponent(text);
  if (heading.depth === 2 || heading.depth === 3) {
    toc.value.push({
      text,
      slug,
      level: heading.depth
    });
    return `<h${heading.depth} id="${slug}"><a href="#${slug}" class="section-link">#</a> ${text}</h${heading.depth}>`;
  }
  return `<h${heading.depth}>${text}</h${heading.depth}>`;
};

// カスタムチャットトークナイザー
const chatTokenizer = {
  name: 'chat',
  level: 'inline',
  start(src: string) {
    const match = src.match(/@@/);
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
    const rule = /^@@\s*([^:]+):\s*([^@]+)\s*@@/;
    const match = rule.exec(src);
    if (match) {
      const [raw, name, message] = match;

      if (raw.includes('```') || (raw.match(/`/g)?.length || 0) % 2 !== 0) {
        return;
      }

      return {
        type: 'chat',
        raw,
        name: name.trim(),
        message: message.trim(),
      };
    }
  },
  renderer(token: any) {
    const isRight = token.name === 'massango';
    const alignClass = isRight ? 'chat-right' : 'chat-left';
    const bubbleClass = isRight ? 'chat-bubble-right' : 'chat-bubble-left';
    const avatarUrl = getAvatarUrl(token.name);

    return `
      <div class="chat-container ${alignClass}">
        <div class="chat-avatar">
          <img src="${avatarUrl}" alt="${token.name}" />
        </div>
        <div class="chat-content">
          <div class="chat-info">
            <div class="chat-name">${token.name}</div>
          </div>
          <div class="chat-bubble ${bubbleClass}">
            <div class="chat-text">${token.message}</div>
          </div>
        </div>
      </div>
    `;
  }
};

// URLからドメインを取得する関数
const extractDomain = (url: string): string => {
  try {
    // URLからドメインを正規表現で抽出
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

      // コードブロック内やインラインコード内でないかチェック
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
    // 安全にドメイン名を取得
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

const noteTokenizer = {
  name: 'note',
  level: 'block',
  start(src: string) {
    const match = src.match(/^:::/m);
    return match ? match.index : undefined;
  },
  tokenizer(src: string) {
    const ruleWithTitle = /^:::note\s+(\w+)\s+([^\n]+)\n(.*?)\n:::/s;
    const matchWithTitle = ruleWithTitle.exec(src);

    // note type title desc
    if (matchWithTitle) {
      const [raw, type, title, description] = matchWithTitle;
      return {
        type: 'note',
        raw,
        noteType: type.toLowerCase(),
        title: title.trim(),
        description: description.trim(),
      };
    }
  },
  renderer(token: any) {
    const { noteType, title, description } = token;


    const noteConfig = {
      info: {
        icon: ``,
        className: 'note-info'
      },
      warning: {
        icon: ``,
        className: 'note-warning'
      },
      danger: {
        icon: ``,
        className: 'note-danger'
      },
      success: {
        icon: ``,
        className: 'note-success'
      },
      tip: {
        icon: ``,
        className: 'note-tip'
      }
    };

    const config = noteConfig[noteType] || noteConfig.info;

    return `
      <div class="note ${config.className}">
        <div class="note-header">
          <div class="note-icon">${config.icon}</div>
          <div class="note-title">${title}</div>
        </div>
        ${description ? `<div class="note-content">${description}</div>` : ''}
      </div>
    `;
  }
};

marked.use({ extensions: [chatTokenizer, linkCardTokenizer, noteTokenizer] });

// --- LaTeX処理 ---
const processLatexInContent = (content: string): string => {
  return content.replace(/(\${2})(.*?[^\\])\1/g, (match, dollar, formula) => {
    try {
      return katex.renderToString(formula, { displayMode: true });
    } catch (error) {
      console.error("KaTeX display rendering error:", error);
      return match;
    }
  });
};

const renderMarkdown = async (content: string): Promise<string> => {
  toc.value = [];
  const processedContent = processLatexInContent(content);

  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  return await marked.parse(processedContent, { renderer });
};

// --- Markdownレンダリング ---
watch(blog, async (newBlog) => {
  if (newBlog?.paper) {
    renderedContent.value = await renderMarkdown(newBlog.paper);
  }
}, { immediate: true });

// --- クライアントのみ: アクティブセクション追跡 ---
const updateActiveSection = useDebounceFn(() => {
  if (!process.client) return;
  const headings = document.querySelectorAll("h2[id]");
  const scrollPosition = window.scrollY + 100;
  let currentSection = "";
  headings.forEach((heading) => {
    const element = heading as HTMLElement;
    if (scrollPosition >= element.offsetTop) currentSection = element.id;
  });
  activeSection.value = currentSection;
}, 100);

const scrollToSection = (slug: string) => {
  if (!process.client) return;
  const element = document.getElementById(slug);
  if (element) {
    const top = element.offsetTop - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

let handleHashLinks: ((e: Event) => void) | null = null;

onMounted(() => {
  window.addEventListener("scroll", updateActiveSection);
  setTimeout(updateActiveSection, 100);

  handleHashLinks = (e: Event) => {
    const target = e.target as HTMLAnchorElement;

    if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
      const href = target.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        const slug = href.substring(1); // #を除去
        scrollToSection(slug);
      }
    }
  };

  const blogContent = document.querySelector('.blog-content');
  if (blogContent) {
    blogContent.addEventListener('click', handleHashLinks);
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateActiveSection);

  if (handleHashLinks) {
    const blogContent = document.querySelector('.blog-content');
    if (blogContent) {
      blogContent.removeEventListener('click', handleHashLinks);
    }
  }
});
</script>


<template>
  <div>
    <div v-if="blog" :key="blog.documentId">
      <div class="blog-header">
        <h1>{{ blog.title }}</h1>
        <p><v-icon name="bi-calendar-event" class="date"/> {{ blog.date }}</p>
        <p>
          <span v-for="tag in blog.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </p>
      </div>

      <div class="blog-container">
        <div class="main-content">
          <div class="blog-content">
            <div v-html="renderedContent"></div>
          </div>
        </div>
        <nav class="toc-sidebar">
          <div class="toc-content">
            <h3 class="toc-title">目次</h3>
            <ul class="toc-list">
              <li v-for="item in toc" :key="item.slug"
                  :class="['toc-item', `toc-level-${item.level}`]">
                <a
                    @click.prevent="scrollToSection(item.slug)"
                    :href="'#' + item.slug"
                    :class="['toc-link', { 'active': activeSection === item.slug }]">
                  {{ item.text }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
.blog-container {
  display: flex;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}
.main-content {
  width: 75%;
  padding-right: 2rem;
}
.toc-sidebar {
  flex: 1;
  position: sticky;
  top: 15rem;
  height: fit-content;
  min-width: 0;
}
.toc-content {
  background: #ffffff;
  border: 1px solid #e5e7ea;
  border-radius: 6px;
  padding: 1rem;
}
.toc-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
}
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toc-item {
  margin: 0.5rem 0;
}
.toc-link {
  display: block;
  color: #6c757d;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border-bottom: 1px solid #eaecef;
}
.toc-link:hover {
  background-color: #f1f3f5;
  color: #343a40;
}
.toc-link.active {
  background-color: #e3f2fd;
  color: #007aff;
  font-weight: 600;
}
.toc-level-3 .toc-link {
  font-size: 0.85rem;
  font-weight: 400;
  color: #a0aec0;
  padding: 0.375rem 0.75rem 0.375rem 1rem;
  position: relative;
}
h1 {
  margin: 30px 0 0 0;
  font-size: 2.5rem;
  font-weight: 700;
}
p {
  margin-top: 10px;
}
.date {
  margin-right: 0.2rem;
}
.blog-content {
  width: 100%;
}
.blog-content :deep(h1), .blog-content :deep(h2), .blog-content :deep(h3),
.blog-content :deep(h4), .blog-content :deep(h5), .blog-content :deep(h6) {
  margin: 1.5em 0 0.5em 0;
  font-weight: bold;
  border-bottom: 1px solid #eaecef;
}
.blog-content :deep(h2) {
  position: relative;
}
.blog-content :deep(.section-link) {
  left: -1em;
  transition: opacity 0.2s ease;
  text-decoration: none;
  color: #888;
  font-weight: bold;
}
.blog-content :deep(.section-link:hover) {
  color: #007aff;
  text-decoration: underline;
  background-color: transparent;
}
.blog-content :deep(p) {
  margin: 1em 0;
  line-height: 1.7;
}
.blog-content :deep(ul), .blog-content :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}
.blog-content :deep(li) {
  margin: 0.5em 0;
}
.blog-content :deep(img) {
  max-width: 100%;
}
.blog-content :deep(code) {
  background-color: #f1f3f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  font-size: 0.9em;
  color: white;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
}
.blog-content :deep(pre) {
  background: linear-gradient(145deg, #1e1e2e, #2d2d44);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
}
.blog-content :deep(pre code) {
  display: block;
  background-color: transparent;
  padding: 0;
  line-height: 1.6;
}
.blog-content :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 1em;
  margin: 1em 0;
  color: #6a737d;
}
.blog-content :deep(table) {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}
.blog-content :deep(th), .blog-content :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 0.5em 1em;
  text-align: left;
}
.blog-content :deep(th) {
  background-color: #f6f8fa;
  font-weight: bold;
}
/* KaTeX数式のスタイル調整 */
.blog-content :deep(.katex) {
  font-size: 1.1em;
}
.blog-content :deep(.katex-display) {
  margin: 1em 0;
  text-align: left;
}
.blog-content :deep(.katex-display > .katex) {
  display: inline-block;
  text-align: initial;
}

/* チャット風UIのスタイル */
:deep(.chat-container) {
  display: flex;
  margin: 20px 0;
  gap: 12px;
  max-width: 100%;
}

/* 左側配置（他のユーザー） */
:deep(.chat-left) {
  justify-content: flex-start;
  flex-direction: row;
}

/* 右側配置（massango） */
:deep(.chat-right) {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

/* アバター部分 */
:deep(.chat-avatar) {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4px;
}

:deep(.chat-avatar img) {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  background-color: #f8f9fa;
}

/* アバター下の名前 */
:deep(.chat-avatar-name) {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  text-align: center;
  font-weight: 500;
  white-space: nowrap;
}

/* チャット内容部分 */
:deep(.chat-content) {
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 80px);
  min-width: 0;
}

:deep(.chat-right .chat-content) {
  align-items: flex-end;
}

:deep(.chat-left .chat-content) {
  align-items: flex-start;
}

/* 吹き出し - 左側（他のユーザー） */
:deep(.chat-bubble-left) {
  background: #e5f1ff;
  border: 2px solid #e5f1ff;
  border-radius: 20px 20px 20px 6px;
  padding: 16px 20px;
  position: relative;
  max-width: 480px;
  word-wrap: break-word;
  margin-left: 8px;
}

/* 吹き出し - 右側（massango） */
:deep(.chat-bubble-right) {
  background: #fedea5;
  border: 2px solid #fedea5;
  border-radius: 20px 20px 6px 20px;
  padding: 16px 20px;
  position: relative;
  max-width: 480px;
  word-wrap: break-word;
  margin-right: 8px;
}

/* 吹き出し内のテキスト */
:deep(.chat-text) {
  line-height: 1.6;
  font-size: 14px;
  margin: 0;
  color: #333;
  font-weight: 400;
}

/* 左側吹き出しの三角形 */
:deep(.chat-bubble-left::before) {
  content: '';
  position: absolute;
  left: -12px;
  top: 24px;
  width: 0;
  height: 0;
  border: 12px solid transparent;
  border-right-color: #e5f1ff;
  border-left: 0;
}

:deep(.chat-bubble-left::after) {
  content: '';
  position: absolute;
  left: -8px;
  top: 26px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-right-color: #e5f1ff;
  border-left: 0;
}

/* 右側吹き出しの三角形 */
:deep(.chat-bubble-right::before) {
  content: '';
  position: absolute;
  right: -12px;
  top: 24px;
  width: 0;
  height: 0;
  border: 12px solid transparent;
  border-left-color: #fedea5;
  border-right: 0;
}

:deep(.chat-bubble-right::after) {
  content: '';
  position: absolute;
  right: -8px;
  top: 26px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-left-color: #fedea5;
  border-right: 0;
}

/* ホバーエフェクト */
:deep(.chat-bubble-left:hover) {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

:deep(.chat-bubble-right:hover) {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

/* モバイル対応 */
@media (max-width: 768px) {
  :deep(.chat-container) {
    gap: 8px;
    margin: 16px 0;
  }

  :deep(.chat-avatar img) {
    width: 44px;
    height: 44px;
  }

  :deep(.chat-content) {
    max-width: calc(100% - 60px);
  }

  :deep(.chat-bubble-left),
  :deep(.chat-bubble-right) {
    max-width: 300px;
    padding: 12px 16px;
    font-size: 13px;
  }

  :deep(.chat-avatar-name) {
    font-size: 10px;
  }
}

/* 非表示にする要素（新しい構造では不要） */
:deep(.chat-info),
:deep(.chat-name) {
  display: none;
}
@media (max-width: 768px) {
  .blog-container {
    flex-direction: column;
    padding: 0;
  }
  .main-content {
    width: 100%;
    padding-right: 0;
  }
  .toc-sidebar {
    width: 100%;
    position: static;
    order: -1;
    margin-bottom: 1.5rem;
  }
  .toc-content {
    padding: 1rem;
  }
  .toc-title {
    font-size: 1.1rem;
  }
  .toc-link {
    font-size: 0.9rem;
  }
  /* モバイルでのKaTeX調整 */
  .blog-content :deep(.katex) {
    font-size: 1em;
  }
  .blog-content :deep(.katex-display) {
    overflow-x: auto;
    overflow-y: hidden;
  }
}
</style>