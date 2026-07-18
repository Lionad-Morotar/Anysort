## Changelog

##### 0.1.0

- 首发 `@anysort/nuxt` module
- `addImports` 注入 `useAnysort`（来自 `@anysort/vue`），组件免 import
- `runtimeConfig.public.anysort.defaults` 暴露项目级默认 `delim` / `orders`
- runtime plugin 把 defaults 注入 `@anysort/core` 全局 config
- `@nuxt/module-builder` 构建（mkdist 产物），`dev:prepare --stub` 支持 dev 读源码
