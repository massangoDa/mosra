// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  plugins: ['~/plugins/oh-vue-icons.js'],
  modules: [
    '@nuxt/image',
  ],
  css: [
      '~/assets/css/main.css',
      '~/assets/css/base.css',
      'katex/dist/katex.min.css'
  ],
  runtimeConfig: {
    public: {
      bazaarApiKey: process.env.VITE_BAZAAR_API_KEY,
      serverUrl: process.env.VITE_SERVER_URL
    }
  },
})
