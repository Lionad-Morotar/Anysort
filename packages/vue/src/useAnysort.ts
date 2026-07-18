import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import anysort from '@anysort/core'

/**
 * 排序规则，沿用 @anysort/core 的 SortCMD 语义：
 * - 字符串命令，如 `'created.date-reverse()'`
 * - 比较函数 `(a, b) => number`
 */
export type UseAnysortRule<T> = string | ((a: T, b: T) => number | undefined)

/**
 * 把 @anysort/core 的命令式排序包装为 Vue 响应式管道。
 *
 * 源数组或排序规则变化时，返回的 ComputedRef 自动重排。
 *
 * 内部复制源数组——anysort 是 in-place 排序（`arr.sort()`），
 * 不能让它 mutate 响应式源；同时剥离 anysort 返回的 wrapper Proxy，
 * 输出纯数组，避免与 vue 的 reactive proxy 双重包装。
 */
export function useAnysort<T>(
  source: MaybeRefOrGetter<T[]>,
  rules?: MaybeRefOrGetter<UseAnysortRule<T> | UseAnysortRule<T>[]>
): ComputedRef<T[]> {
  return computed(() => {
    const arr = toValue(source)
    const r = toValue(rules)
    // 复制源，避免 anysort 的 in-place 排序污染响应式源
    const copy = [...arr]
    const cmds = r == null ? [] : Array.isArray(r) ? r : [r]
    // anysort 的泛型签名依赖 Plugins/CMD 推导，composable 对外暴露简化类型，内部用窄化签名
    const sort = anysort as unknown as (arr: T[], ...cmds: UseAnysortRule<T>[]) => T[]
    const wrapped = cmds.length > 0 ? sort(copy, ...cmds) : sort(copy)
    // 剥离 wrapper Proxy，返回纯数组
    return [...wrapped]
  })
}
