# TESTING

Anysort 的测试架构、覆盖策略与运行方式。

## 框架与工具

- **Vitest 4**：测试框架 + runner（`test/index.test.ts`），断言用其内置 `expect`
- **@vitest/coverage-v8**：覆盖率（reporter: text + json-summary，instrument 源码 `src/**/*.ts`，排除入口 `src/index.ts`）
- 当前覆盖率 ≈ 97.5%（v8 源码口径，README 徽章）

## 测试结构

主套件 `test/index.test.ts` 按主题分组（describe 嵌套）：

1. **Test Anysort Configuration**：`autoSort` / `autoWrap` / `orders` 开关行为
2. **Test Anysort APIs**：核心用例，外层循环让同一套用例跑两遍——分别验证字符串命令 API 与 `wrap().apply()` API 等价
   - basic sorting functions（数字、字符、字符串、原始值混排、日期、symbol、函数名、对象、混合类型）
   - advance use cases（多属性多级排序）
   - edge cases（空数组、null/undefined 末尾、错误属性跳过、不可比较跳过）
   - build-in plugins（i / reverse / is / nth / all / has / not / len / get / rand 逐个覆盖）
   - advance plugin operations（自定义插件、多命令组合）
3. **Test Proxy API**：链式调用 `.i().is('c')...`、嵌套对象 `.locals.date.result()`
4. **Expected Error**：非法命令、插件参数错误、重复包装
5. **Warn**：不可比较类型（用 `Symbol.toStringTag` 构造）

辅助测试文件：

- `test/types.ts`：纯编译期断言（`Expect<Equal<...>>` + `@ts-expect-error`），由 vitest typecheck（tsgo）驱动，作为 Full Typed 卖点的类型回归门禁。内部多处推导边界失效（见 [CONCERNS.md](./CONCERNS.md) 类型层既有债务），后续专项修复
- `test/readme-example.ts`：验证 README 示例可编译运行

## 覆盖率策略

- 测试直接 `import anysort from '../src/main'`（源码，非 build 产物）；v8 coverage 经 sourcemap 映射拿源码级行覆盖，无需非 min 版本
- 覆盖率徽章通过 `coverage:badge` 脚本生成（基于 `.badge-config`）

## 运行

```sh
pnpm test          # vitest run（含 typecheck）
pnpm watch:test    # vitest watch 模式，监听 test/ 与 src/ 变化自动重跑
```

测试不依赖 `build/` 产物——改源码后直接跑测试即可，无需先 build。
