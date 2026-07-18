## Changelog

## Unreleased

> 版本号待定（当前 0.1.0，breaking 重构按 semver 应 0.2.0；占位 Unreleased，发版时定号）。

- **breaking**：重构为 IR（数据描述符）中心的编译器三段式——字符串命令 / 链式操作 / IR 数据三入口汇聚到统一中间表示，再编译成 `SortFn`
- 新增：`parseRule` / `parseSpec` / `chain` / `compileRule` / `compileSpec` / `combineFns` / `validateRule` / `validateSpec` / `extend` / `extendAll`
- 新增：IR 契约 `SortOp`（`get` / `call`）/ `SortRule` / `SortSpec` / `SortArg`，arg 还原原生类型（`nth(2)` → number `2`）
- 新增：链式形态 B（`chain(arr).path.plugin().run()`，不副作用，`.run()` / `.compile()` / `.spec` 三出口）+ Full Typed（`Chainable<T,C>` 双参递归，沿元素 keyof 自动补全，非法路径编译期报错；自定义插件运行时注册，静态层无补全）
- **breaking**：砍除旧 wrapper Proxy（`autoWrap` / `patched`）、`autoSort` / `orders` 默认类型排序、`type-utils` 类型体操、`_` 旧语法、字符串 join+split 往返
- 行为：空规则（空 spec / 空 ops / loose 全 skip）保持源顺序；`compareSortArg` 保证全序性（NaN / 非标量视为相等，避免 TimSort 不确定排序）
- 工程：构建产物统一 `dist/`（dual CJS/ESM/UMD，gzip ≈ 2.1KB），named exports；`anysort` 主入口加 `filter(Boolean)` 容错与 IR `validateRule` 校验

##### 0.1.0

- 包名从 `anysort-typed` 迁移至 `@anysort/core`（monorepo 改造）
- 进入 0.x 打磨期：API 暂继承 3.x，1.0 前可能 breaking
- 源码与测试整体迁移自 `anysort-typed`，行为零变化

> 以下为前身 `anysort-typed`（1.x–3.x）的历史变更记录。

##### 3.4.0

* chore: add esm artifacts
* chore: move building tool chains to vite（Rollup → Vite 8 库模式 + rolldown 后端）
* feat: add `asc` and `desc` build-in plugins, example: `anysort(arr, 'date-desc()')`
* build: 测试 Mocha+should+nyc+npm-watch → Vitest 4（v8 coverage，直接测源码）
* build: lint ESLint 8 eslintrc → oxlint 1.74（typescript-eslint 不兼容 TS7，换 oxc Rust parser + oxlint-tsgolint type-aware 适配 tsgo）
* build: TypeScript 5.5 → 7.0（tsgo Go 编译器）；d.ts 由 vite-plugin-dts 改为 tsc 直接 emit（TS7 兼容）
* fix: Proxy wrapper 对 symbol 属性的防御（现代运行时/测试内省会触发）
* fix: 跨平台大小写敏感导入 './sort' → './Sort'
* chore: 清理废弃依赖（rollup-plugin-uglify/minize、eslint-plugin-node、standard、should、npm-watch）

##### 3.3.0

* chore: add minified cjs artifacts `index.min.js`

##### 3.2.0

* fix type error: `anysort(['1']).length.reverse()`

##### 3.1.0

* 重写类型，字符串形式调用、代理调用、传入排序函数调用现在都能得到类型支持
  * 类型测试用例见 test/types.ts
  * 编译时导出了类型，引用地址在 build/types/index.d.ts
  * 完善测试用例
* 接口变更
  * 鉴于 Anysort 和原生 sort 的使用场景不同（排序速度有较大差距），arrayInstance.sort(anysort('...')) 这种形式的调用被废弃
  * 不再劫持 anysort(arr).sort()，调用 sort 时会返回 Array.prototype.sort

##### 3.0.0

* 接口变更，使用 anysort(arr) 将会返回一个被包装的 arr 对象（以下简称为包装对象），并有能力直接通过属性调用排序插件，如：anysort(arr).has('a') 等同于 anysort(arr, 'has(a)')，也等同于 anysort(arr).apply('has(a)')
  * 错误使用：array.sort(anysort(['plugin-a', 'plugin-b']))
  * 可以使用：array.sort(anysort('plugin-a', 'plugin-b'))
  * 可以使用：anysort(arr, 'plugin-a', 'plugin-b')
  * 可以使用：anysort(arr, ['plugin-a', 'plugin-b'])
  * 可以使用：anysort(arr).apply('plugin-a', 'plugin-b')
  * 可以使用：anysort(arr).apply(['plugin-a', 'plugin-b'])
* 包装对象接口：
  * anysort(arr).apply('plugin(arg)')   // 等同于 anysort(arr, 'plugin(arg)')
  * anysort(arr).sort((a, b) => a - b)  // 等同于 anysort(arr, (a, b) => a - b)
  * anysort(arr).get('attr')            // 等同于 anysort(arr, 'attr')
  * anysort(arr).attra.attrb.result()   // 等同于 anysort(arr, 'attra.attrb')
  * anysort(arr).attra.plugin(arg)      // 等同于 anysort(arr, 'attra-plugin(arg)')
  * anysort(arr).plugina_pluginb(arg)   // 等同于 anysort(arr, 'plugina()-pluginb(arg)')
* 新增内置插件 get，用于获取对象中某个属性值：anysort(arr, get(object.a.b)) 等同于 anysort(arr, object.a.b)
* 新增内置插件 nth，用于获取数组的第 n 个值
* 新增默认配置项 autoSort，默认为 true，用于设定即使 anysort 在调用时传入空参数也会返回一个默认的排序函数（默认使用 little-than 的比较逻辑）
* 新增默认配置项 autoWrap，默认为 true，用于设定经 anysort 调用后回传的数组是否是包装对象
* 完善测试用例
* 修复跑测试用例时仍会输出警告的问题

##### 2.0.0

* 使用 TypeScript 重写了插件逻辑，修复了一些逻辑错误
* 内置插件只留下了关键的 i、reverse、rand、is、all、has、not、len
* 完善测试用例

##### 1.4.x

* 新增自定义插件功能
* 新增统计插件 all

##### 1.3.0

* 新增忽略大小写插件

##### 1.2.x

* 新增长度插件，以统计字符串或数组的长度
* null 或 undefined 的值在比较时会被移到队尾
* symbol 在比较时会使用其字符串字面量的字典顺序进行比较

##### 1.1.0

* 新增了随机排序插件

##### 1.0.0

* Anysort 正式版本发布啦~
