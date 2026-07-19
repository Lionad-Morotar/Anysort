import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

// dev/test 解耦：@anysort/core 直接解析到 core 源码（packages/core/src），
// 无需先 build core 即可跑 vue 包测试 —— 消除 workspace 内部包互引的时序耦合。
export default defineConfig({
  resolve: {
    alias: {
      '@anysort/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url))
    }
  },
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.ts']
    }
  }
})
