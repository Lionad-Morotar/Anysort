import { addImports, defineNuxtModule } from '@nuxt/kit'

/**
 * @anysort/nuxt module
 *
 * auto-import `useAnysort`（来自 @anysort/vue），组件中免 import。
 *
 * 旧版通过 runtimeConfig 注入 core 的 delim/orders 全局 config；新 core 砍除了
 * 全局 config（delim 移至 parseRule 的 option，orders/autoSort 移除），故 module
 * 不再注入。项目级 delim 自定义请直接用 core 的 parseRule(cmd, { delim })。
 */
export default defineNuxtModule({
  meta: {
    name: '@anysort/nuxt',
    configKey: 'anysort',
    compatibility: { nuxt: '^4.0.0' }
  },
  setup() {
    addImports({
      name: 'useAnysort',
      from: '@anysort/vue'
    })
  }
})
