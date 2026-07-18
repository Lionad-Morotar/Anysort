## Changelog

##### 0.2.0

- **breaking**: 无规则（null / 空字符串 / 空数组）时保持源顺序，不再触发 core 的默认类型排序
- 修复：直接传比较函数（非 ref 包裹）不生效——`toValue` 会把比较函数当 getter 无参调用，改用 `fn.length` 区分 getter 与比较函数
- 性能：依赖 in-place 副作用直接返回复制数组，省去剥离 anysort wrapper Proxy 的二次拷贝

##### 0.1.0

- 首发 `useAnysort()` composable：响应式排序管道
- 支持 `Ref` / getter / 原始数组作为源
- 支持字符串命令、比较函数、规则数组（沿用 `@anysort/core` 的 SortCMD 语义）
- 源或规则变化时自动重排；内部复制源数组，不污染响应式状态
