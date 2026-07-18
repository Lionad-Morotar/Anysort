# STRUCTURE

Anysort 的目录布局、关键位置与命名约定。

## 目录概览

```
anysort/
├── src/                # 源码（TypeScript，共约 790 行）
│   ├── index.ts        # 入口，导出 factory 与 Anysort 类型
│   ├── main.ts         # 核心：factory、wrapperProxy、字符串命令解析
│   ├── Sort.ts         # Sort 类与按类型排序逻辑
│   ├── build-in-plugins.ts  # 内置插件集合（mapping / result 两类）
│   ├── config.ts       # 全局配置（delim / orders / autoWrap / autoSort）
│   ├── type.ts         # 对外类型定义
│   ├── type-utils.ts   # 类型体操（路径推导、命令校验、Proxy 调用类型）
│   └── utils.ts        # 运行时工具（getType / walk / isFn ...）
├── test/
│   ├── index.test.ts   # 主测试套件（vitest + expect，直接 import 源码）
│   ├── types.ts        # 类型测试（vitest typecheck 驱动）
│   └── readme-example.ts  # README 示例验证
├── types/              # 构建产物：.d.ts 类型声明（多文件，index.d.ts 为入口）
├── build/              # 构建产物（UMD / CJS / ESM）
├── statics/            # README 用图（LOGO、示例截图）
├── vite.config.ts      # 库模式构建配置
├── vitest.config.ts    # 测试 + coverage + typecheck 配置
├── .oxlintrc.json     # oxlint 1.74 lint（替代 ESLint）
├── tsconfig.json       # TS 配置（类型检查）
├── package.json
└── pnpm-lock.yaml
```

## 命名约定

- 源文件：小写或 PascalCase 混用（`Sort.ts` 是 PascalCase，其余小写）
- 导入 `Sort.ts` 统一用 `'./Sort'`（大小写正确，跨平台安全）
- 插件名：短小英文（`i` / `is` / `nth` / `has` / `get` / `asc` / `desc` ...）
- 类型导出：PascalCase（`Anysort`、`AnySortWrapper`、`SortFn`）
- 测试文件：`*.test.ts`（vitest 默认匹配）

## 关键位置速查

| 关注点 | 位置 |
| --- | --- |
| 排序入口函数 | `src/main.ts` `genFactory` |
| Proxy 链式实现 | `src/main.ts` `wrapperProxy`（含 symbol 属性防御） |
| 字符串命令解析 | `src/main.ts` `genSortFnFromStr` |
| 按类型比较核心 | `src/Sort.ts` `sortByTypeOrder` |
| 插件注册与 pipeline | `src/Sort.ts` `class Sort` |
| 内置插件定义 | `src/build-in-plugins.ts` |
| 类型路径推导 | `src/type-utils.ts` `GetPath` / `ObjectKeyPaths` |
| 命令/调用类型校验 | `src/type-utils.ts` `isValidStringCMD` / `InvokePluginCall` |
| 全局配置 | `src/config.ts` |
