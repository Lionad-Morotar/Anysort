# ARCHITECTURE

Anysort 的架构模式、数据流与核心抽象。设计目标：用统一的比较器（comparator）抽象覆盖"按属性排序、按插件变换、字符串命令、Proxy 链式"四种调用方式。

## 核心抽象

一切排序最终归约为一个 `SortFn: (a, b) => SortVal`（SortVal 即 number）。四种调用方式都编译到 SortFn：

1. **函数模式**：用户直接传 `(a, b) => number`，原样使用
2. **字符串命令模式**：`'created.date-reverse()'` 经 `genSortFnFromStr` 解析为插件序列，构造 SortFn
3. **多命令组合**：多个 SortFn 通过 `flat` 组合，短路语义（前一个返回非 0 即采用，实现多级排序）
4. **Proxy 链式模式**：`anysort(arr).locals.date.reverse()` 收集路径后生成字符串命令，回到路径 2

## 数据流（以字符串命令为例）

```
用户输入 'created.date-reverse()'
  ↓ genSortFnFromStr (src/main.ts:14)
按 config.delim '-' 切分 → ['created.date', 'reverse()']
  ↓ 正则 /^([^(]+)(\(([^)]*)\))?$ 区分
  - 'created.date' → 无括号 → 注册 get 插件，arg='created.date'
  - 'reverse()'    → 有括号 → 注册 reverse 插件
  ↓ Sort.register (src/Sort.ts:87)
pipeline 累积 [{mapping, get}, {result, reverse}]
  ↓ Sort.seal() (src/Sort.ts:111)
reverse(pipeline) 后 compose：result 在最外层包裹输出，mapping 包裹 sortByTypeOrder 的输入
  ↓ 得到 SortFn
arr.sort(SortFn)
```

## 分层

- **入口层** `src/index.ts` → `src/main.ts`：factory、命令分发、Proxy 包装
- **排序层** `src/Sort.ts`：`Sort` 类管理 plugin pipeline，`seal()` compose 出最终 SortFn；`sortByTypeOrder` 是默认比较基准（按类型优先级）
- **插件层** `src/build-in-plugins.ts`：mapping 插件（变换比较值）、result 插件（变换比较结果）
- **类型层** `src/type.ts` + `src/type-utils.ts`：编译期校验路径与命令合法，不参与运行时

## 类型优先级排序（sortByTypeOrder）

异构数组（如 `[0, 'a', new Date(), null]`）默认按 `config.orders` 的数值优先级分组排序（`src/Sort.ts:51`）：

```
number(1) < string(2) < symbol(3) < date(4) < object(5) < function(6) < rest(7) < void(8)
```

- 同类型：`sortBySameType` 将值转 ComparableValue（number / string / boolean / null）后比较
- 异类型：`sortByDiffType` 直接比较 order 数值
- `void`（undefined / null）：undefined 跳过，null 归入 rest（除非显式配置 void order）

## 插件模型

两类插件，统一签名 `(sort: Sort, arg?: string) => Sort`：

- **mapping 插件**：调 `sort.map(fn)`，fn 把比较值 a 映射为可比较值（如 `get` 取嵌套路径、`i` 转小写、`has` 转布尔）
- **result 插件**：调 `sort.result(fn)`，fn 变换最终比较结果（如 `reverse` 取反、`rand` 随机）

`seal()` 时 pipeline 反序 compose：mapping 包裹内层 SortFn 的输入，result 包裹输出。后注册的插件位于 compose 链最外层。

## Proxy 链式 API（wrapperProxy）

`src/main.ts:38` 用 `Proxy` 拦截属性读取：

- 维护闭包内 `pathStore: string[]`
- 读到普通属性名 → push 进 pathStore，返回 proxy 自身（链式）
- 读到插件名 → 拼接 `pathStore.join('.') + '-' + plugin` 成命令字符串，触发排序
- 读到下划线属性（如 `reverse_reverse`）→ 旧语法兼容，转 `'()-'` 分隔（已标记为考虑废弃）

类型层 `AnySortInvoke`（`src/type-utils.ts:228`）递归映射对象所有嵌套属性 + 插件调用签名，使链式调用编译期类型安全。

## 术语表

| 术语 | 含义 |
| --- | --- |
| SortFn | 比较器 `(a, b) => number`，排序的最终归约形态 |
| SortCMD | 排序命令，可以是 SortFn 或字符串命令 |
| pipeline | Sort 内部的插件序列，seal 时 compose |
| mapping 插件 | 变换比较值的插件（作用于输入） |
| result 插件 | 变换比较结果的插件（作用于输出） |
| orders | 类型优先级表，决定异构数组排序 |
| patched | Proxy 标记位 `__ANYSORT_PATCHED__`，防止数组被重复包装 |
| delim | 命令分隔符，默认 `-` |
