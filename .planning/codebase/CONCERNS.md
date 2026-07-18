# CONCERNS

Anysort 的技术债务、已知问题与需要注意的脆弱点。

## 已解决（3.4.0 架构升级）

- ✅ **跨平台导入路径**：`src/main.ts`、`src/build-in-plugins.ts`、`src/type.ts` 的 `'./sort'` 已统一为 `'./Sort'`，case-sensitive 文件系统（Linux/CI）不再失败
- ✅ **包管理器不一致**：scripts 已全部统一 pnpm，无 `npm run` / `npm-watch` 残留
- ✅ **构建工具链迁移**：Rollup → Vite 8 库模式已落地（CHANGELOG 3.4.0-wip 意图完成）
- ✅ **Proxy symbol 脆弱**：`wrapperProxy` 已加 `typeof prop !== 'string'` 防御，现代运行时/测试框架（vitest toEqual 内省等）访问 symbol 属性不再崩溃
- ✅ **废弃依赖清理**：rollup-plugin-uglify/minize、eslint-plugin-node、eslint-config-standard、should、npm-watch、cross-env、vite-plugin-dts 全部移除
- ✅ **TypeScript 7 升级**：5.5 → 7.0（tsgo Go 编译器）。typescript-eslint 8 不兼容 TS7（peerDep `<6.1.0` + 依赖被 tsgo 移除的 `ts.Extension` enum），改用 **oxlint 1.74**（Rust 原生 TS parser，零 `typescript` 包依赖）替代 ESLint + typescript-eslint。d.ts 由 vite-plugin-dts 改为 **tsc 直接 emit**（vite-plugin-dts 在 TS7 下经 `@typescript/typescript6` fallback 只生成不完整单文件，tsc emit 生成完整多文件）

## 类型层既有债务（待处理）

- **test/types.ts 的 extends/Proxy 边界断言失效**：`@ts-expect-error` 标注的 wrongPlugin 用例失效——`anysort.extends` 的 `isSortPluginObjects<U>` 对错误输入整体推导为 `never`，吞掉逐条错误；Proxy 链式 `AnySortInvoke` 在边界属性（如 `.length.reverse()`）推导为 undefined。这些在 TS 5.5 下即存在（types.ts 此前未被 CI 检查），修复需调整 `type-utils.ts`/`type.ts` 的类型推导算法。vitest typecheck（配置较宽松）通过，但 `tsc --ignoreConfig` 直接检查报 ~13 错误。**非本次升级引入，超 Out of Scope（类型算法），建议后续专项修复**
- **src 运行时显式 any**：`tsconfig` 的 `noImplicitAny: false` 保留；运行时多处显式 `any`（`wrapperProxy` 的 `arg: string`、`getCompareValue` 的 `(x: any)`）是有意的类型放宽（Full Typed 是对外卖点，运行时选择性放宽）

## oxlint lint 规则收敛

- oxlint 1.74 默认规则集较宽松（接近 eslint），与项目既有代码冲突少。`.oxlintrc.json` 仅关闭 `no-unused-vars`（types.ts 编译期断言用未用别名）+ `no-explicit-any`（运行时有意的显式 any）——比初选的 Biome（需关 13 条规则）更契合项目。`oxlint-tsgolint`（type-aware，tsgo 驱动）已装，后续可启用 type-aware 规则增强。

## 源码中的设计性待办

代码内遗留较多设计性 TODO（描述未来意图，非追踪编号）：

- `src/Sort.ts` `@todo refactor x => comparableValue`、`@todo extensible for custom types`
- `src/type-utils.ts` `ObjectKeyPaths` 推导出原型属性（如 `a.toString` / `a.pop`），待移除
- `src/build-in-plugins.ts` `TODO reduce compiled code size`、`TODO plugin 'remap'`
- `src/main.ts` 下划线旧语法 `reverse_reverse` 标记 "being considered for deprecation"

## rand 插件的随机性

- `src/build-in-plugins.ts` `rand` 每次比较都调用 `Math.random()`，排序算法 O(n log n) 次比较各自独立随机
- 结果分布不均、不稳定、不可复现；适合轻度洗牌，不适合要求公平随机的场景

## 工程化缺失

- 无 CI（未见 `.github/workflows`）
- 无自动化发布流程（手动版本 + 手动 publish）
- 无 formatter（oxlint 只 lint 不格式化）；如需统一格式可后续加 Prettier 或换 Biome

## API 设计注意

- `main` 字段指向 ESM min 产物（`build/index.esm.min.js`），略不寻常（多数库 main 指 CJS）；`exports` 字段更规范
- `extends` 安装插件是全局副作用（直接修改 `plugins` 对象），多次调用累积，无法卸载
- `extends` 的链式调用（`anysort.extends(...).extends(...)`）被禁用：会触发 TS "类型实例化过深、且可能无限" 错误（见 `test/types.ts` 注释及被注释掉的测试用例），这是 Full Typed 类型递归推导的固有边界
