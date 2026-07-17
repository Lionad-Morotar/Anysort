# CONCERNS

Anysort 的技术债务、已知问题与需要注意的脆弱点。

## 跨平台导入路径（高优先）

- `src/main.ts:1` 与 `src/build-in-plugins.ts:2` 以 `'./sort'`（小写）导入 `src/Sort.ts`（大写 S）
- 当前依赖 macOS 大小写不敏感（case-insensitive）文件系统才能解析
- 在 Linux / CI / case-sensitive 文件系统上构建会失败
- 修复方向：将导入改为 `'./Sort'`，或重命名文件为 `sort.ts`

## 包管理器不一致

- 仓库用 `pnpm-lock.yaml`，但 `package.json` scripts 写 `npm run` / `npm-watch`
- 混用可能导致依赖解析差异；建议统一为 pnpm，并改写 scripts（`npm-watch` 替换为 pnpm 等价方案）

## 类型安全放宽

- `tsconfig.json` 中 `noImplicitAny: false`、`noImplicitThis: false`
- 运行时代码多处 `any`（如 `wrapperProxy` 内 `arg: string = ''`、`getCompareValue` 的 `(x: any)`）
- 类型层虽严格（Full Typed 是对外卖点的核心），但运行时实现并非完全类型安全

## 源码中的设计性待办

代码内遗留较多设计性 TODO（描述未来意图，非追踪编号）：

- `src/Sort.ts:9` `@todo refactor x => comparableValue`、`@todo extensible for custom types`
- `src/type-utils.ts:75` 移除 `ObjectKeyPaths` 推导出的原型属性（如 `a.toString` / `a.pop`）
- `src/build-in-plugins.ts:14` `TODO reduce compiled code size`、`TODO plugin 'remap'`
- `src/main.ts:67` 下划线旧语法 `reverse_reverse` 标记"being considered for deprecation"

## rand 插件的随机性

- `src/build-in-plugins.ts:92` `rand` 每次比较都调用 `Math.random()`，排序算法 O(n log n) 次比较各自独立随机
- 结果分布不均、不稳定、不可复现；适合轻度洗牌，不适合要求公平随机的场景

## 测试覆盖缺口

- `test/types.ts` 内多处 `// TODO`，类型层测试不完整（如 `extends` 未测）
- README 明确标注 `Full API Doc TODO`、`Benchmark TODO`、`Vue3 TODO`

## 工程化缺失

- 无 CI（未见 `.github/workflows`）
- 无自动化发布流程（手动版本 + 手动 publish）
- 无 Prettier，仅 ESLint
- `codecov/` 目录疑似历史残留，当前无上传步骤
- 覆盖率徽章为静态图片，非动态

## API 设计注意

- `main` 字段指向 ESM min 产物（`build/index.esm.min.js`），略不寻常（多数库 main 指 CJS）；`exports` 字段更规范
- `extends` 安装插件是全局副作用（直接修改 `plugins` 对象），多次调用累积，无法卸载
