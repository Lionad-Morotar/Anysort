# CONCERNS

Anysort monorepo 的技术债务、已知问题与脆弱点。

## 已解决（monorepo 改造 0.1.0）

- ✅ **monorepo 化**：单包 `anysort-typed` → pnpm monorepo（`packages/{core,vue,nuxt}` + `playground/{vue,nuxt}`），三层包依赖图 `nuxt → vue → core`
- ✅ **scope 迁移**：`anysort-typed` → `@anysort/core`（扁平 `anysort` 被 paulmillr 占，`@anysort/*` scope 可用）
- ✅ **dev/test 解耦**：`tsconfig.base` paths（→ core d.ts，tsc 层避 rootDir 跨界）+ vitest `resolve.alias`（→ core src，无需先 build）+ nuxt module-builder stub
- ✅ **useAnysort composable**：响应式排序管道，内部复制源避免 in-place 排序 mutate 响应式状态，剥离 wrapper Proxy 返回纯数组
- ✅ **nuxt module e2e**：`@nuxt/test-utils` 验证 auto-import + runtimeConfig（覆盖构建期行为，单测难暴露）

（3.4.0 已解决项继续有效：跨平台导入大小写、包管理器统一 pnpm、Vite 8 库模式、Proxy symbol 防御、废弃依赖清理、TS7 + oxlint、入口字段规范化、构建产物 gitignore）

## 工具链版本隔离（已知妥协）

- **nuxt 包锁 TS5**：`@nuxt/module-builder` 1.0.2 不兼容 TS7（tsgo 改了 CJS 模块导出格式，Node 无法检测 `convertCompilerOptionsFromJson` 等命名导出）。core/vue 用 TS7，nuxt 用 TS5。混版本是工具链适配时差的临时解，待 module-builder 适配 TS7 后统一。
- **`@vitejs/plugin-vue` 5.2.4 peer vite `^5||^6` unmet**：实际用 vite 8.1.5，peer 声明未更新但实际兼容（playground build 绿）。监控 plugin-vue 对 vite 8 的官方支持。

## 类型层既有债务（core，待处理）

- **`test/types.ts` 的 extends/Proxy 边界断言失效**：`@ts-expect-error` 标注的 wrongPlugin 用例失效——`anysort.extends` 的 `isSortPluginObjects<U>` 对错误输入推导为 `never`，吞掉逐条错误；Proxy 链式 `AnySortInvoke` 在边界属性（如 `.length.reverse()`）推导为 undefined。`tsc --ignoreConfig` 直接检查报 ~13 错误，但 vitest typecheck（配置较宽松）通过。**非本次升级引入，建议 core 0.x 专项修复**（D5 明确不在 monorepo 改造范围）。
- **src 运行时显式 any**：`tsconfig` 的 `noImplicitAny: false` 保留；运行时多处显式 `any`（`wrapperProxy`、`getCompareValue`）是有意的类型放宽（Full Typed 是对外卖点，运行时选择性放宽）。

## nuxt module 待改进

- **runtimeConfig 未用 defu 合并**（P3 advisory，kimi-k3 审查）：`packages/nuxt/src/module.ts` 直接覆盖 `runtimeConfig.public.anysort = options.defaults ?? {}`，若用户在 `nuxt.config` 的 `runtimeConfig.public.anysort` 手动配置（而非走 `anysort` configKey），会被 module 的 `defaults: {}` 抹空。Nuxt module 惯例是 `defu(现有值, options.defaults)`。边缘场景（两个配置入口混用），留后续。

## 工程化缺失

- 无 CI（`.github/workflows` 不活跃）
- 无自动化发布（手动版本 + 手动 publish，`RELEASE.md` checklist 兜底 workspace 依赖联动）
- 无 changesets（手动分包 CHANGELOG）
- 无 formatter（oxlint 只 lint 不格式化）

## 源码中的设计性待办（core）

- `Sort.ts` `@todo refactor x => comparableValue`、`@todo extensible for custom types`
- `type-utils.ts` `ObjectKeyPaths` 推导出原型属性（如 `a.toString` / `a.pop`），待移除
- `build-in-plugins.ts` `TODO reduce compiled code size`、`TODO plugin 'remap'`
- `main.ts` 下划线旧语法 `reverse_reverse` 标记 "being considered for deprecation"
- `rand` 插件每次比较独立随机，结果分布不均、不可复现（适合轻度洗牌）

## API 设计注意（core）

- `extends` 安装插件是全局副作用（直接修改 `plugins` 对象），多次调用累积，无法卸载
- `extends` 的链式调用（`anysort.extends(...).extends(...)`）被禁用：触发 TS "类型实例化过深、且可能无限" 错误（Full Typed 类型递归推导的固有边界）
