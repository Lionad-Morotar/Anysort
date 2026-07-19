# STRUCTURE

Anysort monorepo 的目录布局、关键位置与命名约定。

## 目录概览

```
anysort/
├── packages/
│   ├── core/                  # @anysort/core — 框架无关排序库
│   │   ├── src/               # 8 文件约 790 行（index/main/Sort/build-in-plugins/config/type/type-utils/utils）
│   │   ├── test/              # index.test.ts / types.ts / readme-example.ts
│   │   ├── vite.config.ts / vitest.config.ts / tsconfig.json
│   │   ├── statics/           # LOGO、示例图（README 用）
│   │   └── package.json       # @anysort/core@0.1.0
│   ├── vue/                   # @anysort/vue — useAnysort composable
│   │   ├── src/               # useAnysort.ts / index.ts
│   │   ├── test/              # useAnysort.test.ts
│   │   ├── vite.config.ts / vitest.config.ts / tsconfig.json
│   │   └── package.json       # @anysort/vue@0.1.0（dep @anysort/core workspace:*）
│   └── nuxt/                  # @anysort/nuxt — Nuxt module
│       ├── src/               # module.ts / runtime/plugin.ts
│       ├── test/              # basic.test.ts（@nuxt/test-utils e2e）
│       ├── vitest.config.ts / tsconfig.json
│       └── package.json       # @anysort/nuxt@0.1.0（dep @anysort/vue + @nuxt/kit）
├── playground/
│   ├── vue/                   # 纯 Vite + Vue3 演示（验证脱离 Nuxt）
│   │   ├── src/               # App.vue / main.ts
│   │   └── vite.config.ts     # alias → vue/core 源码（dev 解耦）
│   └── nuxt/                  # Nuxt 4 演示 + e2e fixture
│       ├── app/app.vue        # 演示 useAnysort auto-import
│       └── nuxt.config.ts     # modules: ['@anysort/nuxt'] + anysort defaults
├── .planning/codebase/        # 本组结构化文档（7 份）
├── docs/                      # flow-dev 产物（gitignored：plans/reports/reviews）
├── pnpm-workspace.yaml        # workspace 声明（packages/* + playground/*）
├── tsconfig.base.json         # 共享 TS 配置 + paths（@anysort/core → types d.ts）
├── package.json               # monorepo 根（private，pnpm -r scripts，共享 devDeps）
├── .oxlintrc.json             # 共享 lint（根）
├── RELEASE.md                 # 手动发版 checklist
├── AGENTS.md / Claude.md      # 项目指令（同步副本）
├── README.md                  # monorepo 总览
└── TODO.md / LICENSE / CODE_OF_CONDUCT.md
```

产物（均 gitignored）：`packages/*/dist`、`packages/core/{build,types}`、`playground/*/.nuxt`。

## 命名约定

- 包名：scope `@anysort/{core,vue,nuxt}`（扁平 `anysort` 被 paulmillr 占）
- 源文件：core 小写/PascalCase 混用（`Sort.ts` PascalCase，余小写）；vue/nuxt 小写
- 导入 `Sort.ts` 统一 `'./Sort'`（大小写正确，跨平台安全）
- nuxt `runtime/` 目录：被注入用户 app 的运行时文件（plugin 等）
- 类型导出 PascalCase（`Anysort`、`UseAnysortRule`、`ModuleOptions`）
- 测试文件：`*.test.ts`（vitest 默认匹配）

## 关键位置速查

| 关注点 | 位置 |
| --- | --- |
| core 排序入口 | `packages/core/src/main.ts` `genFactory` |
| Proxy 链式实现 | `packages/core/src/main.ts` `wrapperProxy` |
| 字符串命令解析 | `packages/core/src/main.ts` `genSortFnFromStr` |
| 按类型比较核心 | `packages/core/src/Sort.ts` `sortByTypeOrder` |
| 内置插件定义 | `packages/core/src/build-in-plugins.ts` |
| **useAnysort composable** | `packages/vue/src/useAnysort.ts` |
| **nuxt module 定义** | `packages/nuxt/src/module.ts` `defineNuxtModule` |
| **runtime config 注入** | `packages/nuxt/src/runtime/plugin.ts` |
| dev/test 解耦（vitest alias） | `packages/vue/vitest.config.ts`（`@anysort/core` → core src） |
| 共享 tsconfig + paths | `tsconfig.base.json`（paths → core types d.ts） |
| 发版流程 | `RELEASE.md` |
| 全局配置 | `packages/core/src/config.ts`（delim / orders / autoWrap / autoSort） |
