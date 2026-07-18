# CONVENTIONS

Anysort monorepo 的代码风格与开发约定。

## monorepo 约定

### 包间依赖

- 内部包用 `workspace:*` 协议（vue/nuxt 的 `dependencies` 含 `@anysort/core: workspace:*`）
- 发布时 pnpm 自动替换 `workspace:*` 为 `^x.y.z`
- 版本 independent（各包独立 bump）；手动版本 + 手动分包 CHANGELOG
- 发布拓扑序：core → vue → nuxt（见 [RELEASE.md](../../RELEASE.md)）

### dev/test 解耦

- **vitest** 用 `resolve.alias` 指向源码（dev/test 不依赖产物）
- **tsc** 用 `tsconfig.base.json` paths 指向 d.ts（build 期，避 rootDir 跨界）
- **nuxt** 用 module-builder stub（dev 期读源码）

### 工具链版本隔离

- core/vue：TypeScript 7（tsgo）
- nuxt：TypeScript 5（`@nuxt/module-builder` 兼容）
- 共享工具上移根 `devDependencies`（typescript/vite/vitest/oxlint/terser/tslib/@types/node），各包不重复声明

## 命令语法（core 用户 API）

- 分隔符 `-`（`config.delim`）
- 路径：点号连接嵌套属性 `'a.b.c'`，支持数组索引 `'a[0]'`
- 插件调用：`name(arg)`，无参插件 `name()`
- 组合：`'created.date-reverse()'` = 先 get 路径再反转结果
- 多命令：数组 `['is(c)', 'i()-reverse()']`，短路语义（多级排序）

## 排序结果约定（core）

- `null` / `undefined` 排到末尾（undefined 完全跳过，null 归 rest）
- 异构数组按 `config.orders` 类型优先级
- 布尔：`true` 优先级低于 `false`（`Sort.ts` `boolean: x => !x`，故 false 排前）

## useAnysort 约定（vue）

- `source` 用 `MaybeRefOrGetter<T[]>`（Ref / getter / 原始数组，`toValue` 统一）
- `rules` 用 `MaybeRefOrGetter<UseAnysortRule | UseAnysortRule[]>`
- 内部 `[...arr]` 复制源，**不 mutate 响应式状态**（anysort 是 in-place 排序）
- 返回纯数组（`[...wrapped]` 剥离 wrapper Proxy，避免与 vue reactive proxy 双重包装）

## nuxt module 约定

- module runtime 文件**显式 `import from '#imports'`**（auto-import 不覆盖 node_modules）
- `runtimeConfig.public.anysort` 暴露默认配置（`delim` / `orders`）
- `configKey: 'anysort'`（`nuxt.config.ts` 用 `anysort: { defaults: {...} }`）

## 错误处理（core）

- 所有抛错信息以 `[ANYSORT]` 前缀（便于测试 `should.throw(/\[ANYSORT\]/)`）
- 插件参数缺失、类型不匹配时抛错（如 `i` 插件作用于非字符串）
- 不可比较的情况（如两个 object）不抛错，`warn` 提示后跳过（保持原序）

## 代码风格

- ES module + TypeScript，`strict` 开启但 `noImplicitAny: false`
- 函数式风格为主（compose、map、reduce），`Sort` 是 core 唯一的类
- 注释描述 why 与设计意图（不描述做了什么）
- 类型层（`type-utils.ts`、`type.ts`、`test/types.ts`）顶部 `/* eslint-disable */`（类型体操触发 lint）

## 提交与版本

- 手动版本管理，各包 independent
- 每包各自 `CHANGELOG.md`
- 无 CI / 无自动化发布（见 [CONCERNS.md](./CONCERNS.md)）
- vertical sliced commit（每个 commit 可独立 build/test）

## 测试约定

- **core**：字符串命令 API 与 `wrap().apply()` API 等价性双跑；直接 import 源码；`test/types.ts` 类型回归门禁
- **vue**：useAnysort 单测（源变化重排、规则变化重排、不 mutate 源、computed 纯数组）
- **nuxt**：e2e（`@nuxt/test-utils` setup + `$fetch`，rootDir 复用 `playground/nuxt`）
