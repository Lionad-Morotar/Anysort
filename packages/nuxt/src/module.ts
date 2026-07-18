import { addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface AnysortDefaults {
  /** 命令分隔符，默认 '-'（@anysort/core config.delim） */
  delim?: string
  /** 类型优先级表，决定异构数组排序（@anysort/core config.orders） */
  orders?: Record<string, number>
}

export interface ModuleOptions {
  /** 项目级默认排序配置，运行时注入 @anysort/core 的全局 config */
  defaults?: AnysortDefaults
}

/**
 * @anysort/nuxt module
 *
 * - auto-import `useAnysort`（来自 @anysort/vue），组件中免 import
 * - 暴露 `runtimeConfig.public.anysort`，runtime plugin 把 defaults（delim/orders）
 *   注入 @anysort/core 的全局 config，实现项目级默认排序规则
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@anysort/nuxt',
    configKey: 'anysort',
    compatibility: { nuxt: '^4.0.0' }
  },
  defaults: {},
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // 暴露默认配置到 runtimeConfig.public.anysort（plugin 运行时读取并注入 core config）
    nuxt.options.runtimeConfig.public.anysort = options.defaults ?? {}

    // auto-import useAnysort from @anysort/vue
    addImports({
      name: 'useAnysort',
      from: '@anysort/vue'
    })

    // runtime plugin：把默认 orders/delim 注入 @anysort/core 的全局 config
    addPlugin(resolve('./runtime/plugin'))
  }
})
