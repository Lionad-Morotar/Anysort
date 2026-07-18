/**
 * IR 契约层：排序规则的数据描述符（Intermediate Representation）。
 *
 * 纯数据、JSON 可序列化，作为字符串命令 / 链式操作 / 外部消费者三入口的统一中间表示。
 * 字段全部使用原生类型——源语言（字符串命令）会把 arg 压扁成 string，IR 还原其本来的类型。
 */

/** call 插件的可接受参数类型（JSON 原生 scalar，可序列化、可跨进程传输）。 */
export type SortArg = string | number | boolean | null

/**
 * 单个操作。get 取对象路径（高频，路径结构化）；call 调用命名插件。
 * mapping/result 的执行细节不进 IR——IR 只描述「做什么」，由 compile 时查插件定义决定「怎么做」。
 */
export type SortOp =
  | { type: 'get'; path: string[] }
  | { type: 'call'; plugin: string; arg?: SortArg }

/**
 * 一条排序规则 = 操作链（取值 → 变换），产出单个 SortFn。
 */
export interface SortRule {
  ops: SortOp[]
}

/**
 * 多属性排序 = 规则数组。前规则决出胜负（非 0）即用，平局才看后规则（短路合并）。
 */
export type SortSpec = SortRule[]

const isSortArg = (v: unknown): v is SortArg =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null

/** 结构校验：断言 op 形态合法（不校验插件名是否存在，那是 compile 时的语义校验）。 */
export function validateOp (op: unknown): asserts op is SortOp {
  if (op == null || typeof op !== 'object') {
    throw new Error(`[anysort] op must be an object, got ${String(op)}`)
  }
  const o = op as Record<string, unknown>
  if (o.type === 'get') {
    if (!Array.isArray(o.path) || o.path.length === 0 || !o.path.every((p: unknown) => typeof p === 'string')) {
      throw new Error(`[anysort] get op requires non-empty string[] path, got ${JSON.stringify(o.path)}`)
    }
    return
  }
  if (o.type === 'call') {
    if (typeof o.plugin !== 'string' || o.plugin.length === 0) {
      throw new Error(`[anysort] call op requires non-empty string plugin name`)
    }
    if (o.arg !== undefined && !isSortArg(o.arg)) {
      throw new Error(`[anysort] call op arg must be SortArg (string|number|boolean|null), got ${JSON.stringify(o.arg)}`)
    }
    return
  }
  throw new Error(`[anysort] unknown op type "${String(o.type)}", expected "get" | "call"`)
}

/** 结构校验：断言 rule 含合法 ops 数组。 */
export function validateRule (rule: unknown): asserts rule is SortRule {
  if (rule == null || typeof rule !== 'object' || Array.isArray(rule)) {
    throw new Error(`[anysort] rule must be an object, got ${String(rule)}`)
  }
  const r = rule as Record<string, unknown>
  if (!Array.isArray(r.ops)) {
    throw new Error(`[anysort] rule requires ops array, got ${JSON.stringify(r.ops)}`)
  }
  r.ops.forEach(validateOp)
}

/** 结构校验：断言 spec 是 rule 数组。 */
export function validateSpec (spec: unknown): asserts spec is SortSpec {
  if (!Array.isArray(spec)) {
    throw new Error(`[anysort] spec must be an array of rules, got ${String(spec)}`)
  }
  spec.forEach(validateRule)
}
