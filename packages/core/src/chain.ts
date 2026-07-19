import type { SortArg, SortOp, SortRule, BuiltinPluginName } from './ir'
import { compileRule, type CompileOptions, type SortFn } from './compile'
import { plugins as builtinPlugins, type PluginDef } from './plugins'

/**
 * 链式前端（形态 B）：Proxy 累积 IR，不触发排序副作用，直到显式 .run()。
 *
 * 访问语义：
 * - meta 属性（source/spec/compile/run）直接返回
 * - 已知插件名（pluginMap 中）→ 返回函数，调用即累积 call op 并重置待定路径
 * - 其他字符串 → 累积为路径段（连续 .a.b.c 合并成单个 get op）
 *
 * 每次链式调用返回新 Chainable（不可变累积，不 mutate 内部状态）。
 * run 复制 source 后排序，绝不 mutate 原数组——这是形态 B 的纯函数式契约。
 *
 * Full Typed：沿元素类型 keyof 递归映射，合法路径自动补全、非法路径编译期报错。
 * 插件方法来自 P（默认内置 11 个）；createAnysort/extend 累积的自定义插件通过 P 注入。
 */

interface ChainMeta<T> {
  readonly source: readonly T[]
  readonly spec: SortRule
  compile (opts?: CompileOptions): SortFn<T>
  run (opts?: CompileOptions): T[]
}

/** 内置插件方法签名（精确 arg）。返回 Chainable<T, P>。 */
interface BuiltinChainPlugins<T, P extends string = BuiltinPluginName> {
  i (): Chainable<T, P>
  asc (): Chainable<T, P>
  desc (): Chainable<T, P>
  reverse (): Chainable<T, P>
  rand (): Chainable<T, P>
  is (arg: SortArg): Chainable<T, P>
  nth (arg: number): Chainable<T, P>
  all (arg: SortArg): Chainable<T, P>
  has (arg: SortArg): Chainable<T, P>
  not (arg?: SortArg): Chainable<T, P>
  len (arg?: number): Chainable<T, P>
}

/**
 * 链式插件方法：内置 11 个（精确 arg）+ P 中自定义插件（通用 arg）。
 * extend 累积的自定义插件通过 P 注入，链式访问 .myPlugin() 有补全。
 */
type ChainPluginCalls<T, P extends string = BuiltinPluginName> =
  BuiltinChainPlugins<T, P> & {
    [K in Exclude<P, BuiltinPluginName>]: (arg?: SortArg) => Chainable<T, P>
  }

/**
 * 链式 Full Typed 类型。
 * - T：源数组元素类型（固定，run/compile 返回 T[]/SortFn<T>）
 * - P：插件名联合（默认内置），决定可用插件方法
 * - C：当前路径上下文（递归，默认 T）；属性访问返回 Chainable<T, P, C[K]>
 */
export type Chainable<T, P extends string = BuiltinPluginName, C = T> =
  ChainMeta<T> & ChainPluginCalls<T, P> & {
    [K in keyof C]: Chainable<T, P, C[K]>
  }

export function chain<T, P extends string = BuiltinPluginName> (
  source: T[],
  pluginMap: Record<string, PluginDef> = builtinPlugins,
): Chainable<T, P> {
  return makeChainable<T, P>(source, [], [], pluginMap)
}

function makeChainable<T, P extends string = BuiltinPluginName> (
  source: T[],
  ops: SortOp[],
  pendingPath: string[],
  pluginMap: Record<string, PluginDef>,
): Chainable<T, P> {
  const pendingToGet = (): SortOp[] =>
    pendingPath.length > 0 ? [{ type: 'get', path: [...pendingPath] }] : []
  const fullOps = (): SortOp[] => [...ops, ...pendingToGet()]

  const self = {
    source,
    get spec (): SortRule { return { ops: fullOps() } },
    compile: (opts?: CompileOptions): SortFn<T> =>
      compileRule<T>({ ops: fullOps() }, { plugins: pluginMap, ...opts }),
    run: (opts?: CompileOptions): T[] =>
      [...source].sort(compileRule<T>({ ops: fullOps() }, { plugins: pluginMap, ...opts })),
  }

  return new Proxy(self as unknown as Chainable<T, P>, {
    get (t, prop, receiver) {
      // symbol（Symbol.toStringTag 等内省）与非 string 透传，避免下方字符串逻辑崩溃
      if (typeof prop !== 'string') return Reflect.get(t as object, prop, receiver)
      // 防 thenable 误判：Promise/await 探测 .then 时返回 undefined，避免链式对象被当 thenable 触发递归
      if (prop === 'then') return undefined
      if (prop in t) return (t as Record<string, unknown>)[prop]
      if (pluginMap[prop] !== undefined) {
        return (arg?: SortArg): Chainable<T, P> => {
          const callOp: SortOp = arg !== undefined
            ? { type: 'call', plugin: prop, arg }
            : { type: 'call', plugin: prop }
          return makeChainable<T, P>(source, [...ops, ...pendingToGet(), callOp], [], pluginMap)
        }
      }
      // 路径段累积：返回新 Chainable，pendingPath 追加
      return makeChainable<T, P>(source, ops, [...pendingPath, prop], pluginMap)
    },
  })
}
