# Agents.md

Anysort（npm 包名 `anysort-typed`）是一个灵活、类型完备（Full Typed）的多属性排序库，用于嵌套对象（nested objects）排序。提供 Proxy 链式 API 与字符串调用（call-with-string）两种模式，零依赖，压缩后约 3KB。

* 现实层你有无限时间和资源，不要因上下文压缩简化任务执行

## 项目上下文

| 文档                                                          | 说明                         |
| ------------------------------------------------------------- | ---------------------------- |
| [README.md](./README.md)                                      | 项目介绍、核心用法与特性示例 |
| [CHANGELOG.md](./CHANGELOG.md)                                | 版本变更记录                 |
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

布局为 single-context（单一上下文）：Anysort 是单一排序库，仓库内无独立的 `CONTEXT.md` 与 `docs/adr/`。领域语言——multi-properties 排序规则、Proxy 链式 API、call-with-string 调用模式、插件机制、Full Typed 类型设计——记录于 [README.md](./README.md) 与 [.planning/codebase/](./.planning/codebase/) 结构化文档。`improve-codebase-architecture`、`diagnose`、`tdd` 等工程技能需要领域上下文时，优先读取 `.planning/codebase/ARCHITECTURE.md` 与 `CONVENTIONS.md`。
