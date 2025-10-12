// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    plugins: ['~/plugins/oh-vue-icons.js', '~/plugins/toast.client.ts', '~/plugins/fullcalendar.js'],
    modules: [
        '@nuxt/image',
        '@nuxt/ui',
        '@pinia/nuxt',
        'nuxt-security'
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
    security: {
        // リクエストの制限機能
        rateLimiter: {
            tokensPerInterval: 150,
            interval: 'hour'
        },
        requestSizeLimiter: {
            maxRequestSizeInBytes: 2000000
        },
        // HTTPメソッド制限
        allowedMethodsRestriction: {
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        },
        // CSRF保護
        csrf: {
            cookie: {
                name: 'csrf_token'
            }
        }
    },
    devServer: {
        https: true,
        host: '0.0.0.0'
    },
    vite: {
        server: {
            https: true,
            proxy: {
                "/api/": {
                    target: 'http://192.168.0.23:5000',
                    secure: false
                }
            },
        }
    },
})
