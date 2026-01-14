<script setup lang="ts">
import { useHead } from '#app';

useHead({
  title: 'MOSRA - About',
  meta: [
    { name: 'description', content: '日常の気づきや考察、趣味のこと、時には数学も。私が感じたことを自由にまとめて発信するブログです。また、自分の欲しいと思ったツールなども公開しています。' },
    { property: 'og:title', content: 'MOSRA - About' },
    { property: 'og:description', content: '日常の気づきや考察、趣味のこと、時には数学も。私が感じたことを自由にまとめて発信するブログです。また、自分の欲しいと思ったツールなども公開しています。' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'MOSRA - About' },
    { name: 'twitter:description', content: '日常の気づきや考察、趣味のこと、時には数学も。私が感じたことを自由にまとめて発信するブログです。また、自分の欲しいと思ったツールなども公開しています。' },
    { name: 'twitter:image', content: '/og.png' },
  ],
});
</script>

<template>
  <div class="container">
    <main class="prose" role="main" aria-labelledby="about-heading">
      <div class="hero-section">
        <h1 id="about-heading">About</h1>
        <p class="lead">
          NuxtやNode.jsを使ったサーバーまわりの実践メモや、スマホの情報などを書いていきます。
          初心者からちょっとマニアックな人まで、気軽に楽しんでください！
        </p>
      </div>

      <section class="section" aria-labelledby="who-heading">
        <h2 id="who-heading">自己紹介</h2>
        <div class="author">
          <figure class="author-avatar">
            <img
                src="/me.png"
                alt="massango（プロフィール写真）"
                width="96"
                height="96"
            />
            <figcaption class="sr-only">massango</figcaption>
          </figure>
          <div class="author-content">
            <p>
              普段はWeb開発にハマっていて、Nuxt、Vue、Vite、Node.jsなどでこのサイトを動かしています。
              サーバーまわりの試行錯誤や「こうやったら動いた！」みたいなメモも、ゆるく残していきます。
              技術も数学も、肩の力を抜いて楽しめたらいいなと思っています。
            </p>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="content-heading">
        <h2 id="content-heading">このブログで読めること</h2>
        <div class="content-grid">
          <div class="content-card">
            <h3>サーバーまわりのメモ</h3>
            <p>NuxtやNode.jsでの開発Tips、Strapiを使ったAPI設定など、実際に試した記録。</p>
          </div>
          <div class="content-card">
            <h3>スマホのメモ</h3>
            <p>root化の方法や、カスタマイズの方法などを分かりやすく解説。</p>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="connect-heading">
        <h2 id="connect-heading">ソーシャルリンク</h2>
        <div class="social-links">
          <a href="https://github.com/massangoDa" class="social-link github">
            <v-icon name="fa-github" animation="wrench" />
            <span>GitHub</span>
          </a>
          <a href="https://open.spotify.com/user/31eqtjsukb2zvxjg7lpz2hk5z4ve" class="social-link spotify">
            <v-icon name="fa-spotify" animation="wrench" />
            <span>Spotify</span>
          </a>
        </div>
      </section>

      <section class="section cta-section" aria-labelledby="cta-heading">
        <h2 id="cta-heading">さっそく読んでみる</h2>
        <p>最新のスマホ情報やサーバーTipsをチェック！</p>
        <div class="cta-links">
          <NuxtLink to="/blogs" class="cta-link primary">
            最新記事を見る
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

/* ヒーローセクション */
.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  padding: 2rem 0;
}

.hero-section h1 {
  font-size: 3rem;
  font-weight: 800;
  background: #007aff;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
}

.lead {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

/* セクション共通 */
.section {
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.section:last-child {
  border-bottom: none;
}

.section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  position: relative;
  padding-left: 1rem;
}

.section h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.25rem;
  width: 4px;
  height: 1.5rem;
  background: #007aff;
  border-radius: 2px;
}

/* 著者セクション */
.author {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.author-avatar {
  flex-shrink: 0;
}

.author-avatar img {
  border-radius: 50%;
  border: 3px solid #fff;
  transition: transform 0.3s ease;
}

.author-avatar img:hover {
  transform: scale(1.05);
}

.author-content {
  flex: 1;
}

.author-content p {
  margin-bottom: 1rem;
  line-height: 1.7;
  color: #475569;
}

.author-content p:last-child {
  margin-bottom: 0;
}

/* コンテンツグリッド */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.content-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #007aff
}

.content-card:hover {
  transform: translateY(-4px);
  border-color: #c7d2fe;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.content-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.content-card p {
  color: #64748b;
  line-height: 1.6;
}

/* ソーシャルリンク */
.social-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #475569;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  background: #ffffff;
}

.social-link:hover {
  background: #f8fafc;
  border-color: #c7d2fe;
  text-decoration: none;
  transform: translateY(-2px);
}

.social-link.github:hover {
  border-color: #24292f;
  color: #24292f;
}

.social-link.spotify:hover {
  border-color: #1db954;
  color: #1db954;
}

/* CTA セクション */
.cta-section {
  text-align: center;
  color: #000;
  border-radius: 16px;
  padding: 3rem 2rem;
  border: none;
}

.cta-section h2 {
  color: #000;
  font-size: 2rem;
}

.cta-section h2::before {
  background: rgba(255, 255, 255, 0.3);
}

.cta-section p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-links {
  display: flex;
  justify-content: center;
}

.cta-link {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  background: #007aff;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-link:hover,
.cta-link:focus {
  transform: translateY(-2px);
  text-decoration: none;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .hero-section h1 {
    font-size: 2.5rem;
  }

  .author {
    flex-direction: column;
    text-align: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .social-links {
    justify-content: center;
  }

  .cta-section {
    padding: 2rem 1rem;
  }
}
</style>