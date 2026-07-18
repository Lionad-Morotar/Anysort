import { defineConfig } from 'vitest/config'

// 测试直接 import 源码（非构建产物），借 v8 coverage 的 sourcemap 映射拿源码级覆盖率
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
    },
    // test/types.ts 是纯编译期断言（Expect<Equal<...>> + @ts-expect-error），
    // 由 vitest typecheck（tsgo）驱动，作为类型回归门禁。
    typecheck: {
      enabled: true,
      include: ['test/types.ts'],
    },
  },
})
