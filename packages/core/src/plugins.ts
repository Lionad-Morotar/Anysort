import type { SortArg } from './ir'

/**
 * 插件声明式注册表。
 *
 * 每个插件用 { kind, apply } 描述：kind 区分执行阶段（mapping 改比较值 / result 改比较结果），
 * apply 接收 arg 返回纯函数。插件不直接操作 Sort 实例，与执行层解耦，便于独立测试与外部消费。
 *
 * 用 `satisfies` 而非 `: Record<string, PluginDef>` 注解——后者会让每个插件沦为联合类型，
 * 导致 `.apply()` 返回联合函数、调用时参数需同时满足 mapping 与 result 签名。
 * satisfies 保留每个插件的字面量具体性（plugins.i 确定是 mapping），apply 返回单一类型。
 * 代价是失去 string 索引签名，故 getPlugin 内部断言回 Record。
 *
 * 所有 apply 统一 `(arg) =>` 单参数签名（无 arg 的插件用 _arg 占位），
 * 保证字面量类型与 PluginDef 接口一致，外部调用形态统一。
 *
 * `get`（取对象路径）未在此处——它是 IR 的一等公民（type:'get'），由 compile 层直接处理。
 */

export type PluginKind = 'mapping' | 'result'

export interface MappingPluginDef {
  kind: 'mapping'
  apply: (arg: SortArg | undefined) => (value: unknown) => SortArg
}

export interface ResultPluginDef {
  kind: 'result'
  apply: (arg: SortArg | undefined) => (res: number) => number
}

export type PluginDef = MappingPluginDef | ResultPluginDef

const requireArg = (name: string, arg: SortArg | undefined): void => {
  if (arg === undefined || arg === '') throw new Error(`[anysort] "${name}" plugin needs an arg`)
}

export const plugins = {
  /* mapping：把比较值映射成可比较的 scalar */

  i: {
    kind: 'mapping' as const,
    apply: (_arg: SortArg | undefined) => (x: unknown): SortArg => {
      if (typeof x !== 'string') throw new Error('[anysort] "i" plugin only works on string')
      return x.toLowerCase()
    },
  },
  is: {
    kind: 'mapping' as const,
    apply: (arg: SortArg | undefined) => {
      requireArg('is', arg)
      return (x: unknown): SortArg => x === arg
    },
  },
  nth: {
    kind: 'mapping' as const,
    apply: (arg: SortArg | undefined) => {
      if (typeof arg !== 'number') throw new Error('[anysort] "nth" plugin needs a number arg')
      return (x: unknown): SortArg => {
        if (Array.isArray(x) || typeof x === 'string') return x[arg] as SortArg
        throw new Error('[anysort] "nth" plugin only works on string or array')
      }
    },
  },
  all: {
    kind: 'mapping' as const,
    apply: (arg: SortArg | undefined) => {
      requireArg('all', arg)
      return (x: unknown): SortArg => {
        if (Array.isArray(x)) return x.every(y => y === arg)
        if (typeof x === 'string') return x === arg
        throw new Error('[anysort] "all" plugin only works on string or array')
      }
    },
  },
  has: {
    kind: 'mapping' as const,
    apply: (arg: SortArg | undefined) => {
      requireArg('has', arg)
      return (x: unknown): SortArg => {
        if (Array.isArray(x)) return x.some(y => y === arg)
        if (typeof x === 'string') return x.includes(arg as string)
        throw new Error('[anysort] "has" plugin only works on string or array')
      }
    },
  },
  not: {
    kind: 'mapping' as const,
    apply: (arg: SortArg | undefined) => (x: unknown): SortArg =>
      (arg !== undefined && arg !== '') ? x !== arg : !x,
  },
  len: {
    kind: 'mapping' as const,
    apply: (arg: SortArg | undefined) => (x: unknown): SortArg => {
      if (!Array.isArray(x) && typeof x !== 'string') throw new Error('[anysort] "len" plugin only works on string or array')
      return typeof arg === 'number' ? x.length === arg : x.length
    },
  },

  /* result：变换比较结果的符号 */

  asc: { kind: 'result' as const, apply: (_arg: SortArg | undefined) => (res: number): number => res },
  desc: { kind: 'result' as const, apply: (_arg: SortArg | undefined) => (res: number): number => -res },
  reverse: { kind: 'result' as const, apply: (_arg: SortArg | undefined) => (res: number): number => -res },
  rand: { kind: 'result' as const, apply: (_arg: SortArg | undefined) => (_res: number): number => (Math.random() < 0.5 ? -1 : 1) },
} satisfies Record<string, PluginDef>

/** 自定义插件表（运行时扩展，与内置 plugins 合并查询）。 */
const customPlugins: Record<string, PluginDef> = Object.create(null)

/** 注册自定义插件，供 IR / 字符串命令 / 链式通过名字调用（扩展内置 11 个之外的能力）。 */
export function extend (name: string, def: PluginDef): void {
  customPlugins[name] = def
}

/** 批量注册自定义插件。 */
export function extendAll (defs: Record<string, PluginDef>): void {
  for (const key in defs) customPlugins[key] = defs[key]
}

/** 查表获取插件定义（内置优先，回退自定义）；未知返回 undefined，由 compile 层决定 throw 或 skip。 */
export function getPlugin (name: string): PluginDef | undefined {
  return (plugins as Record<string, PluginDef>)[name] ?? customPlugins[name]
}

export function isMappingPlugin (def: PluginDef): def is MappingPluginDef {
  return def.kind === 'mapping'
}

export function isResultPlugin (def: PluginDef): def is ResultPluginDef {
  return def.kind === 'result'
}
