## Changelog

##### 0.1.0

- 首发 `useAnysort()` composable：响应式排序管道
- 支持 `Ref` / getter / 原始数组作为源
- 支持字符串命令、比较函数、规则数组（沿用 `@anysort/core` 的 SortCMD 语义）
- 源或规则变化时自动重排；内部复制源数组，不污染响应式状态
