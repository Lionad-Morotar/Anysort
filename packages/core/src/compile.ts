import type { SortArg, SortRule, SortSpec } from './ir'
import { plugins as builtinPlugins, isMappingPlugin, type PluginDef } from './plugins'
import { walk } from './utils'

/**
 * 后端：把 IR 编译成 SortFn。
 *
 * compileRule 遍历 ops 构建 pipeline：
 * - get / mapping 插件 → 比较值映射函数（串联：value → get(path) → i() → ...）
 * - result 插件 → 比较结果变换（单条规则至多一个，套在最外层）
 *
 * compileSpec 多规则短路合并：前规则决出胜负（非 0）即用，平局才看后规则。
 * 空 spec 返回恒 0（不改变顺序，保持源）。
 *
 * loose 模式：未知插件名 warn+skip 该 op；严格模式抛错。非法路径由 walk warn+返回 undefined。
 */

export type SortFn<T = unknown> = (a: T, b: T) => number

export interface CompileOptions {
  loose?: boolean
  /** 插件 map（默认内置 11 个）；createAnysort/extend 传入累积的自定义插件 */
  plugins?: Record<string, PluginDef>
}

/**
 * 比较 SortArg，保证全序性（自反/反对称/传递）—— TimSort 不校验比较函数一致性，
 * 违反时静默产出不确定顺序。故非标量值（对象/NaN 等）视为相等（返回 0，保持原序），
 * 对齐旧版 sortByTypeOrder 对未知类型 warn+视为相等的 graceful degrade。
 */
const compareSortArg = (a: SortArg | undefined, b: SortArg | undefined): number => {
  if (a === b) return 0
  // null / undefined 排后（取不到路径、空集合）
  if (a === undefined || a === null) return 1
  if (b === undefined || b === null) return -1
  // 异类型：按类型名稳定排序
  if (typeof a !== typeof b) return typeof a < typeof b ? -1 : 1
  if (typeof a === 'boolean') return Number(a) - Number(b)
  if (typeof a === 'string') return a < (b as string) ? -1 : 1
  if (typeof a === 'number') {
    // NaN 与任何值比较均为 false，会破坏反对称；双 NaN 视为相等，单 NaN 排后
    if (Number.isNaN(a)) return Number.isNaN(b as number) ? 0 : 1
    if (Number.isNaN(b as number)) return -1
    return a < (b as number) ? -1 : 1
  }
  // 契约外的类型（运行时 walk 可能返回对象等）：视为相等，避免破坏全序
  return 0
}

export function compileRule<T> (rule: SortRule, opts?: CompileOptions): SortFn<T> {
  // 空 ops = 无操作 = 保持原序（与空 spec 语义一致，避免退化为「按原始值排序」导致对象数组不稳定）
  if (rule.ops.length === 0) return () => 0
  const loose = opts?.loose ?? false
  const pluginMap = opts?.plugins ?? builtinPlugins
  const mappings: Array<(v: unknown) => SortArg> = []
  let resultFn: ((res: number) => number) | null = null

  for (const op of rule.ops) {
    if (op.type === 'get') {
      mappings.push((v: unknown) => walk(op.path)(v) as SortArg)
      continue
    }
    const def = pluginMap[op.plugin]
    if (!def) {
      if (loose) continue
      throw new Error(`[anysort] unknown plugin "${op.plugin}"`)
    }
    if (isMappingPlugin(def)) {
      mappings.push(def.apply(op.arg))
    } else {
      if (resultFn) throw new Error('[anysort] a rule may have at most one result plugin')
      resultFn = def.apply(op.arg)
    }
  }

  // loose 全 skip 防线：所有 op 被跳过且无 result 时保持原序，
  // 避免回退到「按原始元素值比较」破坏全序（对象数组会不确定排序）
  if (mappings.length === 0 && !resultFn) return () => 0

  const applyMappings = (v: unknown): SortArg => {
    let r: unknown = v
    for (const m of mappings) r = m(r)
    return r as SortArg
  }

  return (a: T, b: T): number => {
    const va = applyMappings(a)
    const vb = applyMappings(b)
    let res = compareSortArg(va, vb)
    if (resultFn) res = resultFn(res)
    return res
  }
}

/** 把多个 SortFn 短路合并：前一个返回非 0 即用，全平局返回 0。空列表返回恒 0（不改变顺序）。 */
export function combineFns<T> (fns: SortFn<T>[]): SortFn<T> {
  if (fns.length === 0) return () => 0
  return (a: T, b: T): number => {
    for (const fn of fns) {
      const res = fn(a, b)
      if (res !== 0) return res
    }
    return 0
  }
}

export function compileSpec<T> (spec: SortSpec, opts?: CompileOptions): SortFn<T> {
  return combineFns(spec.map(rule => compileRule<T>(rule, opts)))
}
