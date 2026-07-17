# STACK

Anysort 的技术栈、构建与开发命令概览。零运行时依赖，构建产物约 3KB（min+gzip）。

## 语言与运行时

- **TypeScript 5.5**（`tsconfig.json`），`target: es6`，`module: esnext`
- `strict: true`，但 `noImplicitAny: false`、`noImplicitThis: false`（类型安全有选择性放宽）
- 仅生成类型声明（`emitDeclarationOnly: true`），运行时代码由 Rollup 编译
- 入口被 `include` 限定为 `src/index.ts`（`tsconfig.json:2`）

## 构建工具

- **Rollup 3**（`rollup.config.mjs`），插件：`@rollup/plugin-commonjs`、`@rollup/plugin-node-resolve`、`@rollup/plugin-typescript`、`rollup-plugin-minize`（生产压缩 + sourcemap）
- 产物三种格式（`rollup.config.mjs:32-61`）：
  - UMD：`build/index.umd(.min).js`
  - CJS：`build/index.cjs.js`（覆盖率测试用，未压缩）、`build/index.cjs.min.js`
  - ESM：`build/index.esm(.min).js`
- 生产构建由 `NODE_ENV=production` 触发压缩（`rollup.config.mjs:11`）
- `prebuild` 用 `rimraf` 清空 `build/`，构建后 `mv` 将 `.d.ts` 移到 `types/`

## 包管理器

- 仓库使用 **pnpm**（存在 `pnpm-lock.yaml`）
- 注意：`package.json` 的 scripts 仍写 `npm run` / `npm-watch`，与锁文件不一致——见 [CONCERNS.md](./CONCERNS.md)

## 测试与质量

- **Mocha 10** + **should** 断言 + **nyc 15** 覆盖率（当前 98%）
- **ESLint 8**（`eslint-config-standard`），无 Prettier
- 测试入口：`cross-env NODE_ENV=production nyc mocha ./test/index`

## npm scripts

| 命令 | 作用 |
| --- | --- |
| `build` | Rollup 生产构建，移动 `.d.ts` 到 `types/` |
| `prebuild` | 清空 `build/` |
| `test` | nyc + mocha 跑 `test/index` |
| `eslint` | 全量 lint --fix |
| `coverage:badge` | 更新覆盖率徽章 |
| `watch:test` | 监听 `build/` 与 `test/` 变化重跑测试 |

## 发布

- npm 包名 `anysort-typed`，`main` 指向 `build/index.esm.min.js`，`exports` 字段提供 import/require/types 三条件
- `files` 字段发布 `build/**`、`README.md`、`statics/*`
- 许可证 MIT
