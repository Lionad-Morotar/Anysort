# @anysort/core

<p align="center">
  <img src="./statics/LOGO.jpg" />
</p>

<p align="center">
  <strong>框架无关的多属性排序核心 · IR（数据描述符）中心的编译器三段式</strong>
</p>

<p align="center">
  <a href="https://github.com/Lionad-Morotar/anysort/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/github/license/Lionad-Morotar/anysort" />
  </a>
</p>

`@anysort/core` 把排序规则抽象为统一的 **IR（Intermediate Representation，数据描述符）**：字符串命令、链式操作、IR 数据三个入口汇聚到同一中间表示，再编译成 `SortFn`。消除了旧版「链式序列化为字符串再反向解析」的往返复杂度，arg 还原原生类型，IR 可 JSON 序列化供外部直接构造。

## 特性

- **三入口等价**：字符串命令 / 链式 Proxy / IR 数据，同意图产同结果
- **IR 纯数据契约**：可 `JSON.stringify` 往复不丢语义，可从配置 / 外部来源程序化构造
- **arg 原生类型**：`nth(2)` 的 arg 是 number `2`，不是字符串 `'2'`
- **链式形态 B**：不副作用、`.run()` / `.compile()` / `.spec` 三出口
- **自定义插件**：`extend` 注册命名插件，三入口通用
- 零依赖，minified + gzip ≈ 2.1KB

## 安装

```sh
pnpm add @anysort/core
```

## 快速开始

```ts
import anysort from '@anysort/core'

const posts = [
  { name: 'Bob', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'carol', age: 25 },
]

// 字符串命令
anysort(posts, 'name')              // 按 name 升序
anysort(posts, 'age-reverse()')     // 按 age 降序
anysort(posts, 'age', 'name')       // 多属性：age 升序，平局按 name

// 比较函数（命令式逃生口，不进 IR）
anysort(posts, (a, b) => a.age - b.age)

// IR 数据描述符（可序列化、可从外部构造）
anysort(posts, { ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'reverse' }] })
```

`anysort` 是 in-place 排序（同 `arr.sort`），需要保留原数组请先复制。

## 三入口

所有入口最终汇聚到 IR，再由 `compileSpec` 编译成 `SortFn`。

### 字符串命令

```ts
import { parseRule } from '@anysort/core'

parseRule('created.date-reverse()')
// { ops: [{ type: 'get', path: ['created', 'date'] }, { type: 'call', plugin: 'reverse' }] }
```

arg 从字符串还原原生类型：`nth(2)` → `2`(number)、`is('foo')` → `'foo'`、`not(true)` → `true`、`is(null)` → `null`。括号内的 `-` 不分段（`is(foo-bar)` → arg `'foo-bar'`）。

### 链式操作（形态 B）

```ts
import { chain } from '@anysort/core'

chain(posts).created.date.reverse().run()     // → 排序后的新数组（不 mutate 源）
chain(posts).created.date.reverse().spec      // → 取出 IR（纯数据，可序列化）
chain(posts).age.compile()                    // → 预编译 SortFn（可复用）
```

链式过程不触发排序（不副作用），直到显式 `.run()`。每次链式调用返回新实例（不可变累积）。

### IR 数据描述符

```ts
import type { SortOp, SortRule, SortSpec, SortArg } from '@anysort/core'

type SortOp =
  | { type: 'get'; path: string[] }                    // 取对象路径
  | { type: 'call'; plugin: string; arg?: SortArg }    // 调用命名插件

type SortArg = string | number | boolean | null
interface SortRule { ops: SortOp[] }
type SortSpec = SortRule[]
```

IR 是纯数据契约，适合从配置、外部来源程序化构造，跨进程传输。

## 内置插件

| 类别 | 插件 | 说明 |
|------|------|------|
| mapping（改比较值） | `i` `is(arg)` `nth(n)` `all(arg)` `has(arg)` `not(arg?)` `len(n?)` | 取路径后变换比较值 |
| result（改比较结果） | `asc` `desc` `reverse` `rand` | 变换排序结果符号 |

`get`（取对象路径）是 IR 的一等公民（`type: 'get'`），不走插件表。

## 自定义插件

```ts
import { extend } from '@anysort/core'

extend('evenFirst', {
  kind: 'mapping',
  apply: () => (x: unknown) => (typeof x === 'number' && x % 2 === 0 ? 0 : 1),
})

anysort([1, 2, 3, 4], 'evenFirst()')  // [2, 4, 1, 3]
```

## API

| 导出 | 说明 |
|------|------|
| `anysort(arr, ...rules)` | 主入口，接受 `string` / `fn` / `IR`，in-place 排序 |
| `parseRule(cmd, opts?)` / `parseSpec(...cmds)` | 字符串 → IR |
| `chain(arr)` | 链式 builder（形态 B） |
| `compileRule(rule, opts?)` / `compileSpec(spec, opts?)` | IR → `SortFn`（`{ loose }` option） |
| `combineFns(fns)` | 多 `SortFn` 短路合并 |
| `validateRule` / `validateSpec` | IR 结构校验 |
| `extend` / `extendAll` | 注册自定义插件 |

## 容错

- **严格模式**（默认）：未知插件名抛错，非法 IR 抛可读的契约错误
- **loose 模式** `compileSpec(spec, { loose: true })`：未知插件名 warn + skip 该 op，不抛错
- 非法路径（`get` 路径不存在）warn + 该值排后；`null` / `undefined` 排后；`NaN` 双值视为相等、单值排后；非标量值（对象等）视为相等保持原序——保证比较函数全序性，避免 TimSort 产出不确定顺序

## 集成

- [`@anysort/vue`](../vue)：`useAnysort()` 把排序包装为 Vue 3 响应式管道
- [`@anysort/nuxt`](../nuxt)：Nuxt module，auto-import `useAnysort`

## Dev & Test

```sh
pnpm install
pnpm --filter @anysort/core test
pnpm --filter @anysort/core build
```

## 背景

前身 npm 包 `anysort-typed`（1.x–3.x），已迁移至 `@anysort` scope 的 monorepo。本次 IR 重构为 breaking 变更，旧版字符串命令语法（`'created.date-reverse()'`）仍兼容。设计原理见 [《🌐 Anysort：灵活、优雅的多属性排序》](https://lionad.art/articles/anysort-2th)。

## License

MIT
