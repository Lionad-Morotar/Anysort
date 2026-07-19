import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// dev 解耦：@anysort/vue 与 @anysort/core 直接解析到源码，
// 无需先 build 任何包即可 dev，HMR 友好。
// 这个 playground 的存在本身验证 G3：useAnysort 在纯 Vite+Vue3（非 Nuxt）环境可用。
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@anysort/vue': fileURLToPath(new URL('../../packages/vue/src/index.ts', import.meta.url)),
      '@anysort/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url))
    }
  }
})
