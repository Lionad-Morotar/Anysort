## Changelog

## Unreleased

##### 1.0.0-alpha.0

- 首发 `useAnysort()` composable：把 `@anysort/core` 的命令式排序包装为响应式管道
- 支持 `Ref` / getter / 原始数组作为源；源或规则变化时自动重排
- 支持字符串命令与比较函数规则（core 的 `AnySortRule` 子集）；`fn.length` 区分无参 getter 与比较函数
- 内部复制源数组排序，不污染响应式状态；无规则（null / 空字符串 / 空数组）时保持源顺序
