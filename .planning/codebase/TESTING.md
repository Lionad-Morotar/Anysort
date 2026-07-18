# TESTING

Anysort monorepo 的测试架构、覆盖策略与运行方式。

## 框架与工具

- **Vitest 4** + **@vitest/coverage-v8**（core/vue 单测，断言用内置 `expect`）
- **@nuxt/test-utils 4**（nuxt e2e，`setup` + `$fetch`）
- **oxlint 1.74**（lint，根 `.oxlintrc.json`）
- core `test/types.ts` 由 vitest typecheck（tsgo）驱动，作为 Full Typed 类型回归门禁

## 各包测试

### core（`packages/core/test/`）

主套件 `index.test.ts` 按主题分组：

1. **Configuration**：`autoSort` / `autoWrap` / `orders` 开关行为
2. **APIs**：外层循环让同一套用例跑两遍——验证字符串命令 API 与 `wrap().apply()` API 等价
   - basic sorting、advance use cases（多属性多级）、edge cases、build-in plugins、custom plugins
3. **Proxy API**：链式调用、嵌套对象
4. **Expected Error** / **Warn**

辅助：

- `test/types.ts`：纯编译期断言（`Expect<Equal<...>>` + `@ts-expect-error`），Full Typed 类型回归门禁
- `test/readme-example.ts`：README 示例验证
- 覆盖率 ≈ 97.5%（v8 源码口径）

### vue（`packages/vue/test/useAnysort.test.ts`）

- 默认 autoSort 排序（无 rules）
- 源 ref 变化时自动重排
- rules ref 变化时自动重排
- **不 mutate 响应式源**（复制保护，源内容/顺序不变）
- getter 作为源
- 返回纯数组（无 wrapper Proxy 泄漏，JSON 序列化干净）

### nuxt（`packages/nuxt/test/basic.test.ts`，e2e）

- `@nuxt/test-utils` `setup({ rootDir: playground/nuxt, server: true })`
- `$fetch('/')` 验证 auto-import `useAnysort`（免 import）+ 排序结果（views 升序 B10>C20>A30）
- `test` script 前置 `pnpm --filter playground-nuxt exec nuxt prepare`（生成 `.nuxt`，e2e 可重复）

## dev/test 解耦（G5 定义性属性）

- vitest `resolve.alias` 把 `@anysort/core` 指向 `packages/core/src/index.ts`（源码）
- **验证**：删 `packages/core/{build,types}` 后 `pnpm --filter @anysort/vue test` 仍通过
- 这保证 core 改动后无需先 build 即可测 vue

## vitest 配置要点

- **e2e 不用 `environment: 'nuxt'`**：那是组件 mount 模式，会 bundle `@nuxt/test-utils` 触发其内部 `bun:test` 条件 import 在 node 下无法 resolve。e2e 用 `setup` + `$fetch`（启动真实 nuxt server），默认 node environment。
- nuxt 包 vitest.config 用 `vitest/config` 的 `defineConfig`（非 `@nuxt/test-utils/config` 的 `defineVitestConfig`，后者注入 environment 'nuxt'）

## 覆盖率策略

- 测试直接 import 源码（vitest alias），v8 coverage 经 sourcemap 拿源码级行覆盖
- core 覆盖率 ≈ 97.5%

## 运行

```sh
pnpm test                       # pnpm -r run test（core/vue/nuxt）
pnpm --filter @anysort/core test
pnpm --filter @anysort/vue test
pnpm --filter @anysort/nuxt test   # 含 prepare playground + e2e
pnpm --filter @anysort/core watch:test  # watch 模式
```

测试不依赖 build 产物（dev/test 解耦）。改源码后直接跑测试。
