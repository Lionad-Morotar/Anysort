# ARCHITECTURE

Anysort monorepo 架构。三层包 `core → vue → nuxt`：core 是框架无关排序核心，vue/nuxt 是框架集成层。

## 包依赖图

```
playground/nuxt ─┐
                 ├─→ @anysort/nuxt ─→ @anysort/vue ─→ @anysort/core
playground/vue ──┴────────────────→ @anysort/vue ─→ @anysort/core
```

- **core**：纯排序，零运行时依赖，框架无关
- **vue**：`useAnysort` composable，纯 Vue 零 Nuxt 依赖
- **nuxt**：Nuxt module，消费 vue 包（auto-import + runtimeConfig）

## core 架构（排序核心）

一切排序归约为 `SortFn: (a, b) => SortVal`（SortVal 即 number）。四种调用方式编译到 SortFn：

1. **函数模式**：`(a, b) => number`，原样使用
2. **字符串命令模式**：`'created.date-reverse()'` 经 `genSortFnFromStr` 解析为插件序列
3. **多命令组合**：多个 SortFn 经 `flat` 组合，短路语义（前一个返回非 0 即采用，多级排序）
4. **Proxy 链式模式**：`anysort(arr).locals.date.reverse()` 收集路径生成命令，回到路径 2

### 数据流（字符串命令）

```
用户输入 'created.date-reverse()'
  ↓ genSortFnFromStr (src/main.ts)
按 config.delim '-' 切分 → ['created.date', 'reverse()']
  ↓ 正则区分有括号/无括号
  - 'created.date' → 注册 get 插件
  - 'reverse()'    → 注册 reverse 插件
  ↓ Sort.seal() compose
得到 SortFn → arr.sort(SortFn)
```

### 分层

- **入口层** `src/index.ts` → `src/main.ts`：factory、命令分发、Proxy 包装
- **排序层** `src/Sort.ts`：`Sort` 类管理 plugin pipeline，`seal()` compose；`sortByTypeOrder` 默认比较基准
- **插件层** `src/build-in-plugins.ts`：mapping 插件（变换比较值）、result 插件（变换比较结果）
- **类型层** `src/type.ts` + `src/type-utils.ts`：编译期校验路径与命令合法，不参与运行时

### 类型优先级排序（sortByTypeOrder）

异构数组按 `config.orders` 数值优先级分组：`number(1) < string(2) < symbol(3) < date(4) < object(5) < function(6) < rest(7) < void(8)`

### 插件模型

两类插件，统一签名 `(sort: Sort, arg?: string) => Sort`：

- **mapping 插件**：`sort.map(fn)`，fn 把比较值映射为可比较值（如 `get` 取嵌套路径、`i` 转小写）
- **result 插件**：`sort.result(fn)`，fn 变换比较结果（如 `reverse` 取反、`rand` 随机）

`seal()` 时 pipeline 反序 compose：mapping 包裹输入，result 包裹输出。

## vue 包：useAnysort 响应式管道

`useAnysort(source, rules) => ComputedRef<T[]>`

- **source**：`MaybeRefOrGetter<T[]>`（Ref / getter / 原始数组，`toValue` 统一）
- **rules**：`MaybeRefOrGetter<UseAnysortRule | UseAnysortRule[]>`（字符串命令 / SortFn / 数组，沿用 core SortCMD 语义）
- 返回 `ComputedRef<T[]>`，源或规则变化时自动重排
- **关键适配**：内部 `[...arr]` 复制源（anysort 是 in-place 排序 `arr.sort()`，不能 mutate 响应式源）；`[...wrapped]` 剥离 anysort 返回的 wrapper Proxy，输出纯数组避免与 vue reactive proxy 双重包装

这是 core 命令式排序做不到的响应式增量（表格多级排序、筛选联动场景）。

## nuxt 包：module 双层注入

### setup（构建期，`src/module.ts`）

- `addImports({ name: 'useAnysort', from: '@anysort/vue' })`：auto-import composable
- `nuxt.options.runtimeConfig.public.anysort = options.defaults`：暴露默认配置

### runtime/plugin（运行期，`src/runtime/plugin.ts`）

- 读 `runtimeConfig.public.anysort.defaults`
- 注入 `@anysort/core` 全局 config（`delim` / `orders`）
- **published module 的 runtime 文件显式 `import from '#imports'`**（auto-import 不覆盖 node_modules，这是 module 作者常踩的坑）

## dev/test 解耦架构

build 期与 dev/test 期模块解析分层：

| 层 | 解析路径 | 用途 |
|---|---|---|
| tsc（typecheck/build） | `tsconfig.base.json` paths → core `types/index.d.ts` | 避免 rootDir 跨界（TS6059） |
| vitest（test） | `vitest.config.ts` resolve.alias → core `src/index.ts` | 无需先 build core（G5） |
| nuxt dev | module-builder stub → module 转译源码 | playground HMR 友好 |

G5 验证：删 `packages/core/dist` 后 vue test 仍通过。

## 术语表

| 术语 | 含义 |
| --- | --- |
| SortFn | 比较器 `(a, b) => number`，排序最终归约形态 |
| SortCMD | 排序命令，SortFn 或字符串命令 |
| pipeline | Sort 内部插件序列，seal 时 compose |
| mapping 插件 | 变换比较值的插件（作用于输入） |
| result 插件 | 变换比较结果的插件（作用于输出） |
| orders | 类型优先级表，决定异构数组排序 |
| patched | Proxy 标记位 `__ANYSORT_PATCHED__`，防止数组重复包装 |
| delim | 命令分隔符，默认 `-` |
| **useAnysort** | vue composable，响应式排序管道 |
| **UseAnysortRule** | useAnysort 的规则类型（string \| SortFn） |
| **module stub** | `nuxt-module-build prepare --stub` 生成的 dev 产物 |
| **workspace:\*** | pnpm 内部包依赖协议，发布时替换为具体版本 |
