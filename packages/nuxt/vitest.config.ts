import { defineConfig } from 'vitest/config'

// e2e 模式：test 文件用 setup({ rootDir, server: true }) + $fetch（启动真实 nuxt server）。
// 不用 environment: 'nuxt'——那是组件 mount 模式，会把 @nuxt/test-utils 当 client 代码 bundle，
// 触发其内部的 bun:test 条件 import 在 node 下无法 resolve。
// e2e 下 @nuxt/test-utils 作为普通 dep 被 node 加载，条件 import 不执行。
export default defineConfig({
  test: {}
})
