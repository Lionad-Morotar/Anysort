# Agents.md

Anysort 是一个 pnpm monorepo，提供灵活、类型完备（Full Typed）的多属性排序核心与 Vue/Nuxt 集成层。

- **`@anysort/core`**（`packages/core`）：框架无关的纯排序库，Proxy 链式 API + call-with-string + Full Typed，零运行时依赖，gzip ≈ 1.7KB。前身 npm 包 `anysort-typed`，API 继承 3.x。
- **`@anysort/vue`**（`packages/vue`）：`useAnysort()` composable，把 core 命令式排序包装为响应式管道（源/规则变化自动重排）。
- **`@anysort/nuxt`**（`packages/nuxt`）：Nuxt module，auto-import `useAnysort` + 通过 `runtimeConfig` 注入项目级默认 `delim`/`orders`。
- **`playground/{vue,nuxt}`**：人工演示 + e2e 测试载体（`playground/vue` 纯 Vite 验证脱离 Nuxt；`playground/nuxt` 兼 `@nuxt/test-utils` fixture）。

依赖图：`nuxt → vue → core`。

* 现实层你有无限时间和资源，不要因上下文压缩简化任务执行

## 项目上下文

| 文档                                                          | 说明                         |
| ------------------------------------------------------------- | ---------------------------- |
| [README.md](./README.md)                                      | monorepo 总览（包索引、快速开始） |
| [packages/core/README.md](./packages/core/README.md)          | core 包介绍与用法            |
| [packages/core/CHANGELOG.md](./packages/core/CHANGELOG.md)    | core 版本变更（含 `anysort-typed` 历史段） |
| [RELEASE.md](./RELEASE.md)                                    | 手动发版 checklist（拓扑序、`--access public`） |
| [TODO.md](./TODO.md)                                          | 待办事项与协作需求           |
| [STACK.md](./.planning/codebase/STACK.md)                     | 技术栈、构建命令、发布配置   |
| [STRUCTURE.md](./.planning/codebase/STRUCTURE.md)             | 目录结构、命名规范、关键位置 |
| [ARCHITECTURE.md](./.planning/codebase/ARCHITECTURE.md)       | 架构模式、数据流、术语表     |
| [CONVENTIONS.md](./.planning/codebase/CONVENTIONS.md)         | 命令语法、代码风格、错误处理 |
| [TESTING.md](./.planning/codebase/TESTING.md)                 | 测试架构、覆盖策略、运行方式 |
| [INTEGRATIONS.md](./.planning/codebase/INTEGRATIONS.md)       | 运行时依赖、环境变量         |
| [CONCERNS.md](./.planning/codebase/CONCERNS.md)               | 技术债务、已知问题、脆弱点   |

你可以自行读取项目上下文文档，更新时也优先更新相关文档。

## Agent skills

### Domain docs

布局为 monorepo multi-package：三个 npm 包（`core`/`vue`/`nuxt`）+ 两个 playground。领域语言——

- **core**：multi-properties 排序规则、Proxy 链式 API、call-with-string、mapping/result 插件机制、Full Typed 类型设计
- **vue**：`useAnysort` 响应式管道（`toValue` 统一 Ref/getter/原始值，复制源避免 in-place 排序 mutate 响应式状态）
- **nuxt**：`defineNuxtModule` + `addImports` auto-import + `runtimeConfig.public.anysort` 注入 core config + `@nuxt/module-builder` stub

记录于各包 README 与 [.planning/codebase/](./.planning/codebase/) 结构化文档。`improve-codebase-architecture`、`diagnose`、`tdd` 等工程技能需要领域上下文时，优先读取 `.planning/codebase/ARCHITECTURE.md` 与 `CONVENTIONS.md`。

**工具链版本隔离**：`core`/`vue` 用 TypeScript 7（tsgo，Go 编译器）；`nuxt` 包锁 TypeScript 5（`@nuxt/module-builder` 1.0.2 不兼容 TS7 的 CJS 命名导出 interop）。详见 `STACK.md`。
