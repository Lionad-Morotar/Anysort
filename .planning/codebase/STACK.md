# STACK

Anysort monorepo 的技术栈、构建与开发命令。core 零运行时依赖（gzip ≈ 1.7KB）；vue/nuxt 提供框架集成层。

## 语言与运行时

### core / vue — TypeScript 7（tsgo）

- TypeScript 7.0（tsgo，Go 原生编译器），`target: es2022`，`module: esnext`，`moduleResolution: bundler`
- `strict: true`，但 `noImplicitAny: false`、`noImplicitThis: false`（运行时选择性放宽）
- core 类型检查 tsc 7（tsgo）；声明文件 `tsc -p` 直接 emit（不依赖 vite-plugin-dts，TS7 下 fallback 只生成不完整单文件）
- core 入口 `include: src/index.ts`，`rootDir: ./src`，`outDir: ./types`

### nuxt — TypeScript 5（版本隔离）

- nuxt 包锁 `typescript ^5.9.0`：`@nuxt/module-builder` 1.0.2 不兼容 TS7（tsgo 改了模块导出格式，Node 无法检测 CJS 命名导出 `convertCompilerOptionsFromJson` 等）
- 局部隔离：`packages/nuxt/node_modules/typescript@5` 覆盖根 TS7，module-builder 解析到 TS5
- core/vue 仍 TS7，混版本是 monorepo 处理工具链适配时差的标准手段

## 构建工具

### core（Vite 库模式）

- Vite 8（`packages/core/vite.config.ts`），库模式 `build.lib`，rolldown 后端
- terser 压缩；产物 ESM/CJS/UMD（`build/index.{esm,cjs,umd}.min.js`，gzip ≈ 1.71/1.71/1.79KB）
- d.ts 由 `tsc -p` emit 到 `types/`（多文件，`types/index.d.ts` 入口）
- `build`: `vite build && tsc -p tsconfig.json`
- vite entry 用 `import.meta.url`（cwd 无关，monorepo 适配）

### vue（Vite 库模式）

- Vite 8（`packages/vue/vite.config.ts`），库模式
- 产物 ESM/CJS（`dist/index.{mjs,cjs}`）+ d.ts（tsc emit），gzip ≈ 0.27KB
- `external: ['vue', '@anysort/core']`（peer/workspace 依赖不打进 bundle）

### nuxt（@nuxt/module-builder）

- `@nuxt/module-builder` 1.0.2（bin 名 `nuxt-module-build`，非 `nuxt-module-builder`）
- 产物 `dist/module.mjs` + `module.d.mts` + `types.d.mts` + `runtime/*`（mkdist 保留结构）
- `dev:prepare`: `nuxt-module-build prepare --stub`（生成 dev 用转译源码，playground HMR 友好）
- `build`: `nuxt-module-build build`

## 包管理器

- pnpm 10（`pnpm-workspace.yaml`：`packages/*` + `playground/*`）
- `workspace:*` 协议串联内部包（vue/nuxt deps `@anysort/core`）
- 发布时 pnpm 自动替换 `workspace:*` 为具体版本号
- `engines: { node: ">=20.19", pnpm: ">=10" }`

## dev/test 解耦（关键设计）

build 期与 dev/test 期的模块解析分层，消除"必须先 build core"的时序耦合：

- **tsc 层**（typecheck/build）：`tsconfig.base.json` 的 paths 指向 core 的 **d.ts 产物**（`types/index.d.ts`），避免 rootDir 跨界（TS6059）
- **vitest 层**（test）：`packages/*/vitest.config.ts` 的 `resolve.alias` 指向 core **源码**（`packages/core/src/index.ts`），无需先 build core（G5）
- **nuxt dev**：module-builder stub（`dev:prepare`）让 playground 读 module 转译源码

## npm scripts（根）

| 命令 | 作用 |
| --- | --- |
| `build` | `pnpm -r run build`（拓扑序 core → vue → nuxt） |
| `test` | `pnpm -r run test` |
| `lint` | `oxlint .` |
| `typecheck` | `pnpm -r run typecheck` |
| `dev:vue` | `pnpm --filter playground-vue dev` |
| `dev:nuxt` | `pnpm --filter playground-nuxt dev` |

## 测试与质量

Vitest 4 + @vitest/coverage-v8（core/vue 单测）；@nuxt/test-utils 4（nuxt e2e）；oxlint 1.74（根，替代 ESLint）。详见 [TESTING.md](./TESTING.md)。

## 发布

- scope `@anysort`（扁平 `anysort` 被 paulmillr 占），independent 版本，各包 0.1.0 起步
- 手动版本 + 手动分包 CHANGELOG（无 CI/changesets，见 [CONCERNS.md](./CONCERNS.md)）
- 发版 checklist: [RELEASE.md](../../RELEASE.md)（拓扑序 core → vue → nuxt，`--access public`，workspace 依赖联动）
- 各包 `publishConfig.access: public`（scoped 包首次发布必须）；nuxt 发布 module-builder build 产物（非 stub）
- 许可证 MIT
