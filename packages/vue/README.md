# @anysort/vue

`useAnysort()` —— 把 [@anysort/core](../core) 的命令式排序包装为 Vue 3 响应式管道。

## 安装

```sh
pnpm add @anysort/vue
```

peerDependency: `vue ^3.3`

## 用法

```ts
import { ref } from 'vue'
import { useAnysort } from '@anysort/vue'

const source = ref([3, 1, 2])
const sorted = useAnysort(source)
// sorted.value === [1, 2, 3]

source.value.push(0)
// sorted.value === [0, 1, 2, 3]  自动重排
```

排序规则支持字符串命令与比较函数（沿用 `@anysort/core` 的 SortCMD 语义）：

```ts
useAnysort(items, 'created.date-reverse()')
useAnysort(items, [(a, b) => a.n - b.n, 'name'])
```

源（`Ref` / getter / 原始数组）或规则变化时，返回的 `ComputedRef` 自动重排。内部复制源数组，不会 mutate 你的响应式状态。

## License

MIT
