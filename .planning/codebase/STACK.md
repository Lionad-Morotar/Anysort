# STACK

Anysort 的技术栈、构建与开发命令概览。零运行时依赖，构建产物 gzip ≈ 1.7KB。

## 语言与运行时

- **TypeScript 7.0**（tsgo，Go 原生编译器），`target: es2022`，`module: esnext`，`moduleResolution: bundler`
- `strict: true`，但 `noImplicitAny: false`、`noImplicitThis: false`（类型安全有选择性放宽）
- 类型检查由 tsc 7（tsgo）负责；声明文件由 `tsc -p` 直接 emit（不依赖 vite-plugin-dts，后者在 TS7 下经 fallback 只生成不完整单文件）
- 入口被 `include` 限定为 `src/index.ts`，`rootDir: ./src`，`outDir: ./types`

## 构建工具

- **Vite 8**（`vite.config.ts`），库模式（`build.lib`），底层 rolldown 1.x（Rust 后端）—— 仅生成 JS 产物
- 压缩：terser（gzip 后 esm/cjs ≈ 1.71KB、umd ≈ 1.79KB）
- 产物三种格式（`fileName` 把 Vite 的 `es` format 映射回 `esm` 命名）：
  - ESM：`build/index.esm.min.js`
  - CJS：`build/index.cjs.min.js`
  - UMD：`build/index.umd.min.js`
- d.ts 由 `tsc -p tsconfig.json` emit 到 `types/`（多文件，`types/index.d.ts` 为入口，`build` script = `vite build && tsc -p`）

## 包管理器

- **pnpm 10**（`pnpm-lock.yaml`），`packageManager: pnpm@10.15.0`
- scripts 全部走 pnpm / 原生 CLI
- `engines: { node: ">=20.19", pnpm: ">=10" }`

## 测试与质量

- **Vitest 4** + **@vitest/coverage-v8**（`vitest.config.ts`）
- 测试直接 import 源码（`src/main`），v8 coverage 经 sourcemap 映射拿源码级覆盖率
- `test/types.ts` 由 vitest typecheck（tsc 7）驱动，作为类型回归门禁
- **oxlint 1.74**（`.oxlintrc.json`）—— 替代 ESLint + typescript-eslint。typescript-eslint 8 不兼容 TS7（peerDep `<6.1.0` + 依赖被 tsgo 移除的 `ts.Extension`），故换用 oxlint（Rust 原生 TS parser，零 `typescript` 依赖）。无 Prettier
- 覆盖率 ≈ 97.5%（v8 源码口径）

## npm scripts

| 命令 | 作用 |
| --- | --- |
| `build` | `vite build && tsc -p`（JS 三格式 + d.ts emit） |
| `test` | vitest run（含 typecheck） |
| `eslint` | oxlint .（命名沿用，实际跑 oxlint） |
| `coverage:badge` | 更新覆盖率徽章 |
| `watch:test` | vitest（watch 模式） |

## 发布

- npm 包名 `anysort-typed`，`main` 指向 `build/index.esm.min.js`，`exports` 字段提供 import/require/types 三条件
- `files` 字段发布 `build/**`、`types/**`、`README.md`、`statics/*`
- 许可证 MIT
