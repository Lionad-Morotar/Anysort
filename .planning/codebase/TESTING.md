# TESTING

Anysort 的测试架构、覆盖策略与运行方式。

## 框架与工具

- **Mocha 10**：测试框架（`test/index.js`）
- **should**：断言库（`.should.eql(...)`）
- **assert**：Node 原生断言（部分用例）
- **nyc 15**：覆盖率（reporter: text + json-summary，扩展名限 `.js`，排除 `test/`）
- 当前覆盖率 98%（README 徽章）

## 测试结构

主套件 `test/index.js` 按主题分组（describe 嵌套）：

1. **Test Anysort Configuration**：`autoSort` / `autoWrap` / `orders` 开关行为
2. **Test Anysort APIs**：核心用例，外层 `for` 循环让同一套用例跑两遍——分别验证字符串命令 API 与 `wrap().apply()` API 等价（`test/index.js:74`）
   - basic sorting functions（数字、字符、字符串、原始值混排、日期、symbol、函数名、对象、混合类型）
   - advance use cases（多属性多级排序）
   - edge cases（空数组、null/undefined 末尾、错误属性跳过、不可比较跳过）
   - build-in plugins（i / reverse / is / nth / all / has / not / len / get / rand 逐个覆盖）
   - advance plugin operations（自定义插件、多命令组合）
3. **Test Proxy API**：链式调用 `.i().is('c')...`、嵌套对象 `.locals.date.result()`
4. **Expected Error**：非法命令、插件参数错误、重复包装
5. **Warn**：不可比较类型（用 `Symbol.toStringTag` 构造）

辅助测试文件：

- `test/types.ts`：类型层测试（大量 `@ts-expect-error` / OK 断言），验证 Full Typed 卖点；但内部多处 `// TODO`，覆盖不完整
- `test/readme-example.ts`：验证 README 示例可编译运行
- `test/example.js`：示例脚本

## 覆盖率策略

- 测试 `require('../build/index.cjs.js')`（非 min 的 CJS 版本），保证 nyc 能统计行覆盖
- `watch:test` 监听 `build/` 与 `test/` 变化自动重跑
- 覆盖率徽章通过 `coverage:badge` 脚本生成静态图片

## 运行

```sh
pnpm test          # nyc + mocha 全量（需先 build，因为测试 require build 产物）
pnpm watch:test    # 开发时监听重跑
```

注意：测试依赖 `build/` 产物，改源码后必须先 `pnpm build` 再跑测试（或用 `watch:test` 同时监听 build 目录）。
