# CONVENTIONS

Anysort 的代码风格与开发约定。

## 命令语法（用户 API）

- 分隔符 `-`（`config.delim`）
- 路径：点号连接嵌套属性 `'a.b.c'`，支持数组索引 `'a[0]'`
- 插件调用：`name(arg)`，无参插件 `name()`
- 组合：`'created.date-reverse()'` = 先 get 路径再反转结果
- 多命令：数组 `['is(c)', 'i()-reverse()']`，短路语义（多级排序）

## 排序结果约定

- `null` / `undefined` 排到末尾（undefined 完全跳过，null 归 rest）
- 异构数组按 `config.orders` 类型优先级
- 布尔：`true` 优先级低于 `false`（`src/Sort.ts:25` `boolean: x => !x`，故 false 排前）

## 错误处理

- 所有抛错信息以 `[ANYSORT]` 前缀（便于测试 `should.throw(/\[ANYSORT\]/)`）
- 插件参数缺失、类型不匹配时抛错（如 `i` 插件作用于非字符串）
- 不可比较的情况（如两个 object）不抛错，`warn` 提示后跳过（保持原序）

## 代码风格

- ES module + TypeScript，`strict` 开启但 `noImplicitAny: false`
- 函数式风格为主（compose、map、reduce），`Sort` 是唯一的类
- 注释以英文为主，描述 why 与设计意图（如 `Sort.seal` 处的 map/reverse 说明）
- 类型层（`type-utils.ts`、`type.ts`、`test/types.ts`）顶部 `/* eslint-disable */`，因大量类型体操会触发 lint

## 提交与版本

- 手动版本管理（recent commit `chore: manual versioning`），当前 `3.4.0-alpha.0`
- CHANGELOG.md 记录版本变更
- 无 CI / 无自动化发布（见 [CONCERNS.md](./CONCERNS.md)）

## 测试约定

- 测试两种 API 等价性：字符串命令 `anysort(arr, cmds)` 与 `anysort.wrap(arr).apply(cmds)`（`test/index.js:72` 循环跑两遍同一套用例）
- 用 `build/index.cjs.js`（非 min 版本）以便 nyc 行覆盖率统计
