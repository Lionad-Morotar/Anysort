# @anysort/nuxt

Nuxt module for [Anysort](../core) —— auto-import `useAnysort` + 通过 `runtimeConfig` 配置项目级默认排序规则。

## 安装

```sh
pnpm add @anysort/nuxt
```

## 用法

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@anysort/nuxt'],
  anysort: {
    defaults: {
      delim: '-',          // 命令分隔符
      orders: { number: 1, string: 2 }  // 类型优先级
    }
  }
})
```

配置后：

- 组件中 `useAnysort` **免 import** 直接可用
- `defaults` 在运行时注入 `@anysort/core` 的全局 config（`delim` / `orders`）

```vue
<script setup lang="ts">
// useAnysort 自动导入
const sorted = useAnysort(() => posts.value, 'created.date-reverse()')
</script>
```

## License

MIT
