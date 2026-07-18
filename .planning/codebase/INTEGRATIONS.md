# INTEGRATIONS

Anysort monorepo 的运行时依赖与外部集成。

## 各包运行时依赖

### @anysort/core

无。零运行时依赖（`dependencies` 字段不存在）。

### @anysort/vue

- `dependencies`: `@anysort/core`（`workspace:*`）
- `peerDependencies`: `vue ^3.3.0`（`toValue` 从 3.3 引入）
- `devDependencies`: `vue ^3.5.0`（测试用）

### @anysort/nuxt

- `dependencies`: `@anysort/core`、`@anysort/vue`（`workspace:*`）、`@nuxt/kit ^4.4.8`
- `devDependencies`: `nuxt ^4.4.8`、`@nuxt/module-builder ^1.0.2`、`@nuxt/schema ^4.4.8`、`@nuxt/test-utils ^4.0.3`、`typescript ^5.9.0`（版本隔离）、`happy-dom ^20.0.11`（test-utils peer）

## 外部服务

无数据库、无鉴权、无 webhook、无第三方 API。

## 环境变量

- `NODE_ENV`：core `utils.ts` `isDev()` 判断（`development` 开启 `warn` 日志）

## 发布渠道

- **npm**：`@anysort/core` / `@anysort/vue` / `@anysort/nuxt`（scope `@anysort`，independent 版本，各 0.1.0）
- **GitHub**：`Lionad-Morotar/anysort`

## 框架集成边界

- **vue 包不依赖 Nuxt**：`useAnysort` 是纯 Vue composable，`playground/vue`（纯 Vite）验证脱离 Nuxt 可用（G3）
- **nuxt 包消费 vue 包**：module 通过 `addImports` 注入 `useAnysort`，不重新实现 composable
- **core config 全局副作用**：nuxt runtime plugin 修改 `anysort.config`（delim/orders）是项目级默认，影响该 nuxt app 所有 anysort 调用
