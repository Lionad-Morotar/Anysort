import { computed, isRef, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import anysort, { type AnySortRule } from '@anysort/core'

/**
 * 排序规则：字符串命令（如 `'created.date-reverse()'`）或比较函数 `(a, b) => number`。
 * 沿用 @anysort/core 的 AnySortRule 子集（core 还接受 IR 数据描述符，vue 层只暴露 string/fn）。
 */
export type UseAnysortRule<T> = string | ((a: T, b: T) => number)

/**
 * 解包可能为 ref/getter 的 rules，但区分 getter 与「本身就是规则的比较函数」：
 * 仅当函数 length===0（无参 getter）时才调用取值。
 *
 * 不能用 vue 的 toValue——它对任何函数都无参调用，会把比较函数规则 (a,b)=>n
 * 误当 getter 求值得到 NaN，再被 filter(Boolean) 滤成空规则。
 *
 * 盲区：rest 参数比较函数 (...args)=>n 的 length===0 会被误判为 getter，属罕见写法。
 */
function unwrapRules<T> (
  rules: MaybeRefOrGetter<UseAnysortRule<T> | UseAnysortRule<T>[]> | undefined
): UseAnysortRule<T> | UseAnysortRule<T>[] | undefined {
  // isRef 判定后再取 .value，避免 unref 把 getter 函数当普通值残留在返回类型里
  const val = isRef(rules) ? rules.value : rules
  if (typeof val === 'function' && val.length === 0) {
    return (val as () => UseAnysortRule<T> | UseAnysortRule<T>[])()
  }
  return val as UseAnysortRule<T> | UseAnysortRule<T>[] | undefined
}

/**
 * 把 @anysort/core 的命令式排序包装为 Vue 响应式管道。
 *
 * 源数组或排序规则变化时，返回的 ComputedRef 自动重排。
 *
 * 实现要点：
 * - 复制源数组——core 的 anysort 是 in-place 排序，不能 mutate 响应式源
 * - 空规则（null / 空字符串 / 空数组）保持源顺序（core 对空规则也保持原序，此处短路避免无谓调用）
 * - core 的 anysort 直接接受 string | fn 规则，无需窄化或中间转换
 */
export function useAnysort<T>(
  source: MaybeRefOrGetter<T[]>,
  rules?: MaybeRefOrGetter<UseAnysortRule<T> | UseAnysortRule<T>[]>
): ComputedRef<T[]> {
  return computed(() => {
    const arr = toValue(source)
    const r = unwrapRules(rules)
    // 对齐 core 的 filter(Boolean)：空字符串等 falsy 规则视为无规则
    const cmds = (r == null ? [] : Array.isArray(r) ? r : [r]).filter(Boolean)
    // 复制源，避免 in-place 排序污染响应式源
    const copy = [...arr]
    // 空规则 = 保持源顺序
    if (cmds.length === 0) return copy
    // core anysort 接受 string | fn | IR，in-place 排序 copy 后即结果
    // vue 规则来自 ref/getter（动态），无法字面量校验，cast 绕过 core 的 SortCMD 约束（运行时 parse 兜底）
    anysort(copy, ...(cmds as unknown as AnySortRule<T>[]))
    return copy
  })
}
