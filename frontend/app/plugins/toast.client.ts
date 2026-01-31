import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import {defineNuxtPlugin} from "nuxt/app";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Toast, {
        // オプション設定
    })
})
