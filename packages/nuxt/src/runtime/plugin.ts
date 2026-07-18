import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import anysort from '@anysort/core'

// published module 的 runtime 文件在 node_modules，nuxt 的 auto-import 不覆盖，
// 故 useRuntimeConfig / defineNuxtPlugin 必须显式从 '#imports' 导入。
export default defineNuxtPlugin(() => {
  const cfg = useRuntimeConfig().public.anysort as
    | { delim?: string; orders?: Record<string, number> }
    | undefined

  if (cfg?.delim) anysort.config.delim = cfg.delim
  if (cfg?.orders) Object.assign(anysort.config.orders, cfg.orders)
})
