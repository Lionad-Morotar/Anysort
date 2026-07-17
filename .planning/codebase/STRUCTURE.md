# STRUCTURE

Anysort 的目录布局、关键位置与命名约定。

## 目录概览

```
anysort/
├── src/                # 源码（TypeScript，共约 783 行）
│   ├── index.ts        # 入口，导出 factory 与 Anysort 类型
│   ├── main.ts         # 核心：factory、wrapperProxy、字符串命令解析
│   ├── Sort.ts         # Sort 类与按类型排序逻辑
│   ├── build-in-plugins.ts  # 内置插件集合（mapping / result 两类）
│   ├── config.ts       # 全局配置（delim / orders / autoWrap / autoSort）
│   ├── type.ts         # 对外类型定义
│   ├── type-utils.ts   # 类型体操（路径推导、命令校验、Proxy 调用类型）
│   └── utils.ts        # 运行时工具（getType / walk / isFn ...）
├── test/
│   ├── index.js        # 主测试套件（mocha + should）
│   ├── types.ts        # 类型测试
│   ├── example.js      # 示例
│   └── readme-example.ts  # README 示例验证
├── types/              # 构建产物：.d.ts 类型声明
├── build/              # 构建产物（UMD / CJS / ESM）
├── statics/            # README 用图（LOGO、示例截图）
├── codecov/            # 历史覆盖率残留
├── rollup.config.mjs   # 构建配置
├── tsconfig.json       # TS 配置（仅生成声明）
├── package.json
└── pnpm-lock.yaml
```

## 命名约定

- 源文件：小写或 PascalCase 混用（`Sort.ts` 是 PascalCase，其余小写）
- **注意**：`src/main.ts:1` 与 `src/build-in-plugins.ts:2` 以 `'./sort'`（小写）导入 `Sort.ts`，依赖 macOS 大小写不敏感文件系统才能解析——跨平台/CI 需警惕（见 [CONCERNS.md](./CONCERNS.md)）
- 插件名：短小英文（`i` / `is` / `nth` / `has` / `get` / `asc` / `desc` ...）
- 类型导出：PascalCase（`Anysort`、`AnySortWrapper`、`SortFn`）

## 关键位置速查

| 关注点 | 位置 |
| --- | --- |
| 排序入口函数 | `src/main.ts:85` `genFactory` |
| Proxy 链式实现 | `src/main.ts:38` `wrapperProxy` |
| 字符串命令解析 | `src/main.ts:14` `genSortFnFromStr` |
| 按类型比较核心 | `src/Sort.ts:51` `sortByTypeOrder` |
| 插件注册与 pipeline | `src/Sort.ts:76` `class Sort` |
| 内置插件定义 | `src/build-in-plugins.ts:16` |
| 类型路径推导 | `src/type-utils.ts:59` `GetPath`、`:71` `ObjectKeyPaths` |
| 命令/调用类型校验 | `src/type-utils.ts:181` `isValidStringCMD`、`:214` `InvokePluginCall` |
| 全局配置 | `src/config.ts:4` |
