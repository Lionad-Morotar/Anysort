// playground/nuxt 兼 e2e fixture（D8）：packages/nuxt/test 的 setup rootDir 指向这里。
// 演示 @anysort/nuxt 的 auto-import + runtimeConfig 默认排序规则。
export default defineNuxtConfig({
  modules: ['@anysort/nuxt'],
  anysort: {
    defaults: {
      delim: '-',
      orders: { number: 1, string: 2 }
    }
  },
  devtools: { enabled: false },
  compatibilityDate: '2025-01-01'
})
