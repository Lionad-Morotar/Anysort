// playground/nuxt 兼 e2e fixture（D8）：packages/nuxt/test 的 setup rootDir 指向这里。
// 演示 @anysort/nuxt 的 auto-import（新 core 无全局 config，module 只做 auto-import）。
export default defineNuxtConfig({
  modules: ['@anysort/nuxt'],
  devtools: { enabled: false },
  compatibilityDate: '2025-01-01'
})
